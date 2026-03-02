/**
 * WhiteBIT API Service
 * Handles cryptocurrency deposit address generation and checking transaction status.
 */

// HMAC-SHA512 Signature Generator
async function generateSignature(payload, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const payloadData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Base function for signed requests to WhiteBIT v4 API
 */
export async function signedRequest(endpoint, data = {}) {
    const apiKey = 'aece2aa60d22cd113dfde486e5450a18';
    const apiSecret = import.meta.env.VITE_WHITEBIT_API_SECRET;

    const userAddresses = {
        BTC: { address: 'bc1qfp433f760s20evz85jcdduymkxers4zumy67mu', minAmount: '0.0005' },
        USDT: { address: 'TPAodhZyBHKuqj46yiGCAAtUuLfL6nGZfj', minAmount: '5' },
        TRX: { address: 'TPAodhZyBHKuqj46yiGCAAtUuLfL6nGZfj', minAmount: '20' },
        TON: { address: 'EQAigd8MjqsJejMuIB0UPhErOlGe22dezkpjvpWt9kOrtkG8', memo: '4713164959', minAmount: '1' }
    };

    const fallbackResponse = () => {
        if (endpoint.includes('address')) {
            const result = userAddresses[data.ticker] || { address: 'ADDRESS_NOT_FOUND', minAmount: '0' };
            return {
                account: {
                    address: result.address,
                    memo: result.memo
                },
                required: {
                    minAmount: result.minAmount
                }
            };
        }
        return [];
    };

    // If no secret, we return user's real addresses as fallback (manual mode)
    if (!apiSecret) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(fallbackResponse());
            }, 800);
        });
    }

    // Add common fields
    const request = `/api/v4/${endpoint}`;
    const nonce = Date.now().toString();
    const payloadBuffer = JSON.stringify({
        ...data,
        request,
        nonce
    });

    const payload = btoa(payloadBuffer);
    const signature = await generateSignature(payload, apiSecret);

    try {
        // Clean URL building to avoid double/missing slashes
        const cleanRequest = request.startsWith('/') ? request.slice(1) : request;
        const response = await fetch(`/wb-proxy/${cleanRequest}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature
            },
            body: payloadBuffer
        });

        if (!response.ok) return fallbackResponse();
        return await response.json();
    } catch (err) {
        // Silent catch to keep console clean
        return fallbackResponse();
    }
}

/**
 * Get deposit address for a specific currency
 */
export const getDepositAddress = async (ticker, network = 'ERC20') => {
    return await signedRequest('main-account/address', { ticker, network });
};

/**
 * Poll for recent deposits to trigger "Thank you" notification
 */
export const checkRecentDeposits = async (ticker) => {
    try {
        const response = await signedRequest('main-account/history', {
            ticker,
            limit: 10,
            offset: 0,
            transactionMethod: 1 // 1 for deposits as per docs
        });

        // The docs show transactions are in the 'records' field
        const records = response?.records || [];
        if (!Array.isArray(records)) return false;

        const fiveMinsAgo = Math.floor(Date.now() / 1000) - 300;

        // According to docs, status 3 or 7 means successful
        return records.some(tx =>
            tx.method === 1 &&
            (tx.status === 3 || tx.status === 7) &&
            tx.createdAt > fiveMinsAgo
        );
    } catch (err) {
        return false;
    }
};
