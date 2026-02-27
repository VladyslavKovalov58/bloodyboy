import React from 'react';
import { Play } from 'lucide-react';
import { translations } from '../translations';

const SlotCard = ({ name, image, hasDemo, link, language, rtp, provider }) => {
    const t = translations[language];

    return (
        <div className="slot-card-container">
            <div className="slot-card-inner">
                {/* Slot Image */}
                <img src={image} alt={name} className="slot-image" />

                {/* Hover State Overlay */}
                <div className="slot-overlay">

                    {/* Top: Name and Provider */}
                    <div className="slot-info-top">
                        <h3 className="slot-name-text">{name}</h3>
                        {provider && <p className="slot-provider-text">{provider}</p>}
                    </div>

                    {/* Center: Circular Play Button */}
                    <div className="slot-play-container">
                        <a
                            href={hasDemo ? link : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`slot-play-button ${!hasDemo ? 'is-disabled' : ''}`}
                            onClick={e => !hasDemo && e.preventDefault()}
                        >
                            <Play size={36} fill={hasDemo ? "white" : "rgba(255, 255, 255, 0.3)"} style={{ marginLeft: hasDemo ? '4px' : '0' }} />
                        </a>
                    </div>

                    {/* Bottom: RTP Badge */}
                    <div className="slot-info-bottom">
                        <div className="slot-rtp-text">
                            {rtp ? `RTP: ${rtp}` : (language === 'ru' ? 'Демо недоступно' : 'No demo')}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .slot-card-container {
                    perspective: 1000px;
                }
                .slot-card-inner {
                    background: var(--bg-card);
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    position: relative;
                    aspect-ratio: 3/4;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    display: flex;
                    flex-direction: column;
                }
                .slot-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .slot-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9) !important; /* Strong darkening as requested */
                    backdrop-filter: blur(4px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    padding: 40px 15px;
                    text-align: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    z-index: 10;
                }
                
                /* Hover States */
                .slot-card-inner:hover {
                    transform: translateY(-8px);
                    border-color: var(--primary-orange);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 107, 0, 0.2);
                }
                .slot-card-inner:hover .slot-image {
                    transform: scale(1.1);
                }
                .slot-card-inner:hover .slot-overlay {
                    opacity: 1;
                    visibility: visible;
                }

                /* Content Transitions */
                .slot-info-top {
                    transform: translateY(-20px);
                    transition: all 0.4s ease;
                    opacity: 0;
                    flex: 0 0 60px; /* Fixed height for name/provider area */
                }
                .slot-play-container {
                    transform: scale(0.8);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    opacity: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1; /* Take up middle space */
                }
                .slot-info-bottom {
                    transform: translateY(20px);
                    transition: all 0.4s ease;
                    opacity: 0;
                    flex: 0 0 20px; /* Fixed height for RTP area */
                }

                .slot-card-inner:hover .slot-info-top,
                .slot-card-inner:hover .slot-info-bottom {
                    transform: translateY(0);
                    opacity: 1;
                }
                .slot-card-inner:hover .slot-play-container {
                    transform: scale(1);
                    opacity: 1;
                }

                /* Typography */
                .slot-name-text {
                    margin: 0 0 4px 0;
                    color: #fff;
                    font-size: 1.1rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    line-height: 1.1;
                    letter-spacing: -0.5px;
                    font-family: inherit;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .slot-provider-text {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .slot-rtp-text {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                /* Play Button */
                .slot-play-button {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-orange) 0%, var(--accent-orange) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    color: #fff;
                    box-shadow: 0 0 30px rgba(255, 107, 0, 0.4);
                    transition: all 0.3s ease;
                    margin: 0 auto;
                }
                .slot-play-button.is-disabled {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.3);
                    box-shadow: none;
                    cursor: not-allowed;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .slot-play-button:not(.is-disabled):hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 40px rgba(255, 107, 0, 0.6);
                    background: linear-gradient(135deg, #ff8c33 0%, var(--primary-orange) 100%);
                }
            `}} />
        </div>
    );
};

export default SlotCard;
