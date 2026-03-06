import type { MCQOption } from './types';

export interface ParsedQuestion {
    id: string;
    question: string;
    options: { key: MCQOption; text: string }[];
}


export function parseQuestion(rawQuestion: string, srNo: number): ParsedQuestion {
    const parts = rawQuestion.split('\n\nOptions:\n');
    const questionText = parts[0];

    let options: { key: MCQOption; text: string }[] = [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
    ];

    if (parts.length > 1) {
        const optionsLines = parts[1].split('\n');
        options = options.map(opt => {
            const line = optionsLines.find(l => l.startsWith(opt.key + ')'));
            return {
                ...opt,
                text: line ? line.substring(3).trim() : ''
            };
        });
    }

    return {
        id: `q${srNo}`,
        question: questionText,
        options,
    };
}
