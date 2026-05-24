import React from 'react';
import './EnvironmentBackground.css';

const EnvironmentBackground = ({ state }) => {
    // Return null if there's no active state
    if (!state || state === 'normal') return null;

    // Generate snowflakes randomly only once per mount to avoid jumping
    const snowflakes = React.useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}vw`,
            animationDuration: `${10 + Math.random() * 10}s`, // fall duration 10-20s
            animationDelay: `-${Math.random() * 20}s`,
            fontSize: `${0.8 + Math.random() * 1.2}em`, // 0.8em - 2em
            swayDuration: `${3 + Math.random() * 4}s`, // 3-7s sway
        }));
    }, []);

    return (
        <div className={`environment-bg ${state}`}>
            {state === 'cold' && (
                <div className="cold-animation">
                    <div className="cloud-container">
                        {/* Cloud SVGs */}
                        <svg className="cloud c1" viewBox="0 0 24 24" fill="#CBD5E0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.1325 20.177 10.2038 17.8687 10.0275C17.4109 6.6433 14.5126 4 11 4C7.13401 4 4 7.13401 4 11C4 11.2383 4.01185 11.4736 4.03487 11.7056C2.28581 12.3828 1 14.043 1 16C1 18.2091 2.79086 20 5 20H17.5V19Z" />
                        </svg>
                        <svg className="cloud c2" viewBox="0 0 24 24" fill="#E2E8F0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.1325 20.177 10.2038 17.8687 10.0275C17.4109 6.6433 14.5126 4 11 4C7.13401 4 4 7.13401 4 11C4 11.2383 4.01185 11.4736 4.03487 11.7056C2.28581 12.3828 1 14.043 1 16C1 18.2091 2.79086 20 5 20H17.5V19Z" />
                        </svg>
                        <svg className="cloud c3" viewBox="0 0 24 24" fill="#CBD5E0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.1325 20.177 10.2038 17.8687 10.0275C17.4109 6.6433 14.5126 4 11 4C7.13401 4 4 7.13401 4 11C4 11.2383 4.01185 11.4736 4.03487 11.7056C2.28581 12.3828 1 14.043 1 16C1 18.2091 2.79086 20 5 20H17.5V19Z" />
                        </svg>
                    </div>
                    <div className="snowflakes" aria-hidden="true">
                        {snowflakes.map(sf => (
                            <div 
                                key={sf.id} 
                                className="snowflake"
                                style={{
                                    left: sf.left,
                                    fontSize: sf.fontSize,
                                    animation: `fall ${sf.animationDuration} linear infinite, sway ${sf.swayDuration} ease-in-out infinite alternate`,
                                    animationDelay: `${sf.animationDelay}, ${sf.animationDelay}`
                                }}
                            >
                                ❅
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {state === 'hot' && (
                <div className="hot-animation">
                    <div className="sun-container">
                        <div className="sun-glow"></div>
                        <svg className="sun-svg" viewBox="0 0 24 24" fill="#FBD38D" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 2V4M12 20V22M4 12H2M22 12H20M4.929 4.929L6.343 6.343M17.657 17.657L19.071 19.071M4.929 19.071L6.343 17.657M17.657 6.343L19.071 4.929" stroke="#FBD38D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    {/* Sand Dunes */}
                    <svg className="dunes" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M0,20 L0,12 Q25,2 50,12 T100,8 L100,20 Z" fill="#FEEBC8" opacity="0.5"/>
                        <path d="M0,20 L0,15 Q30,8 60,15 T100,10 L100,20 Z" fill="#FCE8B2" opacity="0.5"/>
                    </svg>

                    {/* Oak Tree */}
                    <div className="tree-container">
                       <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="oak-tree">
                            <path d="M12 22V14M12 14C10 14 9 12 9 12M12 14C14 14 15 12 15 12" stroke="#A0522D" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 4C8.68629 4 6 6.68629 6 10C6 11.3323 6.43444 12.5631 7.16524 13.5654C7.71261 14.3162 8.54483 14.8517 9.47963 14.9687L10 15H14L14.5204 14.9687C15.4552 14.8517 16.2874 14.3162 16.8348 13.5654C17.5656 12.5631 18 11.3323 18 10C18 6.68629 15.3137 4 12 4Z" fill="#D4E157" opacity="0.7"/>
                       </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnvironmentBackground;
