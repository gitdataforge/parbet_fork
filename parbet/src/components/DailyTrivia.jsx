import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useStore';

export default function DailyTrivia() {
    const { setWallet, balance, diamonds } = useAppStore();
    const [trivia, setTrivia] = useState(null);
    const [answered, setAnswered] = useState(false);

    useEffect(() => {
        fetch('https://opentdb.com/api.php?amount=1&category=21&type=boolean')
            .then(res => res.json())
            .then(data => setTrivia(data.results[0]));
    }, []);

    const handleAnswer = (ans) => {
        if (answered) return;
        setAnswered(true);
        if (ans === trivia.correct_answer) {
            setWallet(balance, diamonds + 50); // Reward 50 diamonds for correct logic
        }
    };

    if (!trivia) return null;

    return (
        <div className="bg-[#1a1a1a] rounded-[24px] p-6 text-white mb-16 shadow-xl border border-white/10">
            <h3 className="font-black text-xl mb-2 text-[#8bc53f]">Daily Parbet Trivia</h3>
            <p className="text-sm font-medium mb-6" dangerouslySetInnerHTML={{__html: trivia.question}}></p>
            <div className="flex space-x-4">
                <button onClick={() => handleAnswer('True')} className={`flex-1 py-3 rounded-xl font-bold ${answered && trivia.correct_answer === 'True' ? 'bg-[#458731]' : 'bg-white/10'}`}>True</button>
                <button onClick={() => handleAnswer('False')} className={`flex-1 py-3 rounded-xl font-bold ${answered && trivia.correct_answer === 'False' ? 'bg-[#458731]' : 'bg-white/10'}`}>False</button>
            </div>
            {answered && <p className="text-xs text-[#8bc53f] mt-4 font-bold">+50 Diamonds Awarded!</p>}
        </div>
    );
}