
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const moveX = x * 15 - 7.5;
      const moveY = y * 15 - 7.5;
      
      heroRef.current.style.setProperty('--move-x', `${moveX}px`);
      heroRef.current.style.setProperty('--move-y', `${moveY}px`);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div 
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center px-8"
      style={{
        '--move-x': '0px',
        '--move-y': '0px',
      } as React.CSSProperties}
    >
      {/* Background blur */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden z-0"
        aria-hidden="true"
      >
        <div 
          className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-blue-100 filter blur-[80px] opacity-60 transform translate-x-[-30%] translate-y-[-30%]"
          style={{
            transform: 'translate(calc(-30% + var(--move-x) * 0.5), calc(-30% + var(--move-y) * 0.5))',
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[60%] h-[60%] rounded-full bg-purple-100 filter blur-[80px] opacity-60 transform translate-x-[30%] translate-y-[30%]"
          style={{
            transform: 'translate(calc(30% - var(--move-x) * 0.3), calc(30% - var(--move-y) * 0.3))',
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 bg-primary/10 rounded-full text-sm font-medium text-primary animate-fade-in">
            Revolutionizing Stock Trading
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-up">
            Trade Smarter, Not Harder
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
            Experience the future of trading with our powerful, intuitive platform.
            Seamlessly manage your portfolio and make informed decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating mockup */}
        <div 
          className="relative mt-20 mx-auto max-w-4xl rounded-lg shadow-xl overflow-hidden animate-fade-up"
          style={{ animationDelay: '600ms' }}
        >
          <div className="glass rounded-lg p-1">
            <div className="bg-white/60 rounded-lg overflow-hidden">
              <div className="h-8 bg-slate-100/80 flex items-center px-4 border-b border-slate-200/70">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Trading Dashboard" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
