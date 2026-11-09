import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef, type CSSProperties } from 'react';

type AnimatedTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

function Char({ char, progress, range }: { char: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative inline-block">
      {/* invisible placeholder keeps the layout; the animated copy sits on top */}
      <span className="invisible">{char}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}

export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });

  const total = text.length;
  const words = text.split(' ');
  let index = 0;

  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, w) => {
        const chars = word.split('').map((c) => {
          const i = index++;
          return <Char key={i} char={c} progress={scrollYProgress} range={[i / total, (i + 1) / total]} />;
        });
        index++; // the space
        return (
          <span key={w} aria-hidden="true">
            <span className="inline-block whitespace-nowrap">{chars}</span>
            {w < words.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </p>
  );
}
