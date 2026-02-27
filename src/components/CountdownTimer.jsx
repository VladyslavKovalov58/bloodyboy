import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetDate, language }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            } else {
                timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const nextTime = calculateTimeLeft();
            setTimeLeft(nextTime);

            if (nextTime.days === 0 && nextTime.hours === 0 && nextTime.minutes === 0 && nextTime.seconds === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    const labels = {
        en: { d: 'd', h: 'h', m: 'm', s: 's' },
        ru: { d: 'д', h: 'ч', m: 'м', s: 'с' }
    };

    const l = labels[language] || labels.en;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            color: 'var(--primary-orange)',
            fontWeight: '800',
            fontSize: '0.9rem'
        }}>
            <Clock size={16} />
            <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {timeLeft.days}{l.d}
                </div>
                <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {timeLeft.hours.toString().padStart(2, '0')}{l.h}
                </div>
                <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {timeLeft.minutes.toString().padStart(2, '0')}{l.m}
                </div>
                <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {timeLeft.seconds.toString().padStart(2, '0')}{l.s}
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
