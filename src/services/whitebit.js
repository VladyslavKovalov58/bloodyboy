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
async function signedRequest(endpoint, data = {}) {
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
        const response = await fetch(`/api/whitebit/${cleanRequest}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature
            },
            body: payloadBuffer
        });

        if (!response.ok) {
            // Only warn on first occurrence of 404 to avoid console flooding
            if (response.status === 404 && !window._whitebitWarned) {
                console.warn('WhiteBIT API endpoint not found (404). Redirects might still be deploying.');
                window._whitebitWarned = true;
            } else if (response.status !== 404) {
                console.warn(`WhiteBIT API issue (${response.status}), using fallback.`);
            }
            return fallbackResponse();
        }

        return await response.json();
    } catch (err) {
        console.error('WhiteBIT API Error:', err);
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
        const history = await signedRequest('main-account/get-deposit-withdraw-history', {
            ticker,
            limit: 10,
            offset: 0
        });

        if (!Array.isArray(history)) return false;

        const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
        return history.some(tx => tx.type === 'deposit' && tx.status === 'finished' && tx.createdAt * 1000 > fiveMinsAgo);
    } catch (err) {
        return false;
    }
};
