class Quiz {
    constructor(container) {
        this.container = container;
        this.questions = container.querySelectorAll('.quiz-question');
        this.score = 0;
        this.initializeQuiz();
    }

    initializeQuiz() {
        this.questions.forEach(question => {
            const options = question.querySelectorAll('.quiz-option');
            options.forEach(option => {
                option.addEventListener('click', () => this.handleOptionClick(option, question));
            });
        });
    }

    handleOptionClick(option, question) {
        if (question.dataset.answered) return;

        const options = question.querySelectorAll('.quiz-option');
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        const isCorrect = option.dataset.correct === 'true';
        const feedback = question.querySelector('.quiz-feedback');
        
        feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = isCorrect ? 
            'Correct! Well done!' : 
            'Incorrect. Try again!';

        if (isCorrect) {
            question.dataset.answered = 'true';
            this.score++;
            this.updateProgress();
        }
    }

    updateProgress() {
        const progress = document.querySelector('.progress');
        const progressText = document.querySelector('.progress-text');
        const totalQuestions = this.questions.length;
        const percentage = (this.score / totalQuestions) * 100;

        if (progress && progressText) {
            progress.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% Complete`;
        }

        if (this.score === totalQuestions) {
            this.unlockNextLesson();
        }
    }

    unlockNextLesson() {
        const nextButton = document.querySelector('.nav-button.next');
        if (nextButton) {
            nextButton.classList.remove('disabled');
            nextButton.href = nextButton.dataset.next;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const quizContainers = document.querySelectorAll('.quiz-container');
    quizContainers.forEach(container => new Quiz(container));
}); 