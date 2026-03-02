import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { getDepositAddress } from '../services/whitebit';
import { translations } from '../translations';

const SupportModal = ({ isOpen, onClose, language }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addressData, setAddressData] = useState(null);
    const [copied, setCopied] = useState(false);
    const t = translations[language];

    const currencies = [
        {
            id: 'BTC',
            name: 'Bitcoin',
            icon: 'https://cdn.whitebit.com/currencies_icon/6be9cda8-d96f-464f-a033-de6f369d0cda.png',
            color: '#F7931A',
            network: 'BTC',
            qr: 'https://bff.whitebit.com/v1/canvas/qr?region=global&url=bc1qfp433f760s20evz85jcdduymkxers4zumy67mu&black=true&image=https%3A%2F%2Fcdn.whitebit.com%2Fcurrencies_icon%2F6be9cda8-d96f-464f-a033-de6f369d0cda.png%3Fv%3D3'
        },
        {
            id: 'USDT',
            name: 'Tether',
            icon: 'https://cdn.whitebit.com/currencies_icon/df1485f2-992c-4052-a5b0-fefdea9474fc.png',
            color: '#26A17B',
            network: 'TRC20',
            qr: 'https://bff.whitebit.com/v1/canvas/qr?region=global&url=TPAodhZyBHKuqj46yiGCAAtUuLfL6nGZfj&black=true&image=https%3A%2F%2Fcdn.whitebit.com%2Fcurrencies_icon%2Fdf1485f2-992c-4052-a5b0-fefdea9474fc.png%3Fv%3D3'
        },
        {
            id: 'TRX',
            name: 'TRON',
            icon: 'https://cdn.whitebit.com/currencies_icon/fc6b94a1-a2e1-4221-8778-05cd02d4adf9.png',
            color: '#FF0013',
            network: 'TRC20',
            qr: 'https://bff.whitebit.com/v1/canvas/qr?region=global&url=TPAodhZyBHKuqj46yiGCAAtUuLfL6nGZfj&black=true&image=https%3A%2F%2Fcdn.whitebit.com%2Fcurrencies_icon%2Ffc6b94a1-a2e1-4221-8778-05cd02d4adf9.png%3Fv%3D3'
        },
        {
            id: 'TON',
            name: 'Toncoin',
            icon: 'https://cdn.whitebit.com/currencies_icon/be6a2146-3ee7-486b-b185-7eba00b09b6e.svg',
            color: '#0088CC',
            network: 'TON',
            qr: 'https://bff.whitebit.com/v1/canvas/qr?region=global&url=EQAigd8MjqsJejMuIB0UPhErOlGe22dezkpjvpWt9kOrtkG8&black=true&image=https%3A%2F%2Fcdn.whitebit.com%2Fcurrencies_icon%2Fbe6a2146-3ee7-486b-b185-7eba00b09b6e.svg%3Fv%3D3'
        },
    ];

    useEffect(() => {
        if (!isOpen) {
            setSelectedCurrency(null);
            setAddressData(null);
            setError(null);
        }
    }, [isOpen]);

    const fetchAddress = async (currency) => {
        setLoading(true);
        setError(null);
        setAddressData(null);
        try {
            const data = await getDepositAddress(currency.id, currency.network);
            setAddressData(data);
            setSelectedCurrency(currency);
        } catch (err) {
            setError(t.errorTitle || 'Error loading address');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{
                width: '100%',
                maxHeight: '85vh',
                maxWidth: '480px',
                background: '#1A1B1F',
                borderRadius: '28px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                        {t.supportStreamer}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '12px',
                        transition: '0.2s'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    {/* Currency Selection - GRID 2x2 */}
                    {!selectedCurrency && !loading && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '8px', gridColumn: 'span 2' }}>
                                {language === 'ru' ? 'Выберите валюту для перевода:' : 'Select currency for support:'}
                            </p>
                            {currencies.map(curr => (
                                <button
                                    key={curr.id}
                                    onClick={() => fetchAddress(curr)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '20px 10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '20px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    }}
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        background: `${curr.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '10px'
                                    }}>
                                        <img src={curr.icon} alt={curr.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '4px' }}>{curr.name}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: '600' }}>{curr.network}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {loading && (
                        <div style={{ padding: '40px 0', textAlign: 'center' }}>
                            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-orange)', margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-dim)' }}>{language === 'ru' ? 'Генерация адреса...' : 'Generating address...'}</p>
                        </div>
                    )}

                    {selectedCurrency && addressData && (
                        <div style={{ animation: 'slideUp 0.3s ease-out' }}>
                            {/* Selected Header */}
                            <button
                                onClick={() => setSelectedCurrency(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-orange)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginBottom: '20px',
                                    padding: 0
                                }}
                            >
                                ← {language === 'ru' ? 'Выбрать другую валюту' : 'Change currency'}
                            </button>

                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '24px',
                                padding: '24px',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{
                                    width: '180px',
                                    height: '180px',
                                    background: '#fff',
                                    margin: '0 auto 20px',
                                    borderRadius: '16px',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                }}>
                                    <img src={selectedCurrency.qr} alt="QR Code" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                                </div>

                                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '8px' }}>
                                    {language === 'ru' ? 'Ваш персональный адрес:' : 'Your personal address:'}
                                </p>

                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    wordBreak: 'break-all',
                                    fontSize: '0.9rem',
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    marginBottom: '12px'
                                }}>
                                    {addressData.account.address}
                                </div>

                                {addressData.account.memo && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <p style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
                                            {language === 'ru' ? 'MEMO | ОБЯЗАТЕЛЬНО ДЛЯ ЗАПОЛНЕНИЯ' : '!!! MEMO / TAG REQUIRED !!!'}
                                        </p>
                                        <div style={{
                                            background: 'rgba(255, 61, 0, 0.1)',
                                            padding: '10px 16px',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            color: 'var(--accent-orange)',
                                            fontWeight: 'bold',
                                            border: '1px solid var(--accent-orange)'
                                        }}>
                                            {addressData.account.memo}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleCopy(addressData.account.address)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: copied ? 'var(--neon-green)' : 'var(--primary-orange)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? t.copiedText : t.copyText}
                                </button>

                                <div style={{
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    color: 'var(--text-dim)',
                                    fontSize: '0.85rem'
                                }}>
                                    <AlertCircle size={14} />
                                    {language === 'ru' ? 'Мин. депозит:' : 'Min. deposit:'}
                                    <span style={{ color: '#fff', fontWeight: '600' }}>
                                        {addressData.required.minAmount} {selectedCurrency.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '24px',
                            background: 'rgba(255, 61, 0, 0.1)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 61, 0, 0.2)',
                            color: 'var(--accent-orange)',
                            textAlign: 'center'
                        }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
                            <p>{error}</p>
                            <button onClick={() => setSelectedCurrency(null)} style={{
                                marginTop: '16px',
                                background: 'var(--accent-orange)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer'
                            }}>
                                {language === 'ru' ? 'Попробовать снова' : 'Try again'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 24px',
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: '0.75rem',
                    color: 'var(--text-dim)',
                    textAlign: 'center',
                    lineHeight: '1.4'
                }}>
                    {language === 'ru'
                        ? 'Пожалуйста, убедитесь, что вы отправляете средства в правильной сети. Средства, отправленные в неправильной сети, могут быть утеряны.'
                        : 'Please ensure you are sending funds on the correct network. Funds sent on the wrong network may be lost.'}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default SupportModal;
