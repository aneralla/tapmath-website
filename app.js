// TapMath Tree Application
class TapMathTree {
    constructor() {
        this.treeStructure = null;
        this.mathConcepts = null;
        this.userProgress = this.loadUserProgress();
        this.currentModal = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderTree();
            this.setupEventListeners();
            this.updateProgressTracker();
        } catch (error) {
            console.error('Failed to initialize TapMath Tree:', error);
            this.showError('Failed to load math concepts. Please refresh the page.');
        }
    }

    async loadData() {
        try {
            // Load tree structure
            const treeResponse = await fetch('./tree-structure.json');
            const treeData = await treeResponse.json();
            this.treeStructure = treeData.treeStructure;

            // Load math concepts
            const conceptsResponse = await fetch('./math-concepts.json');
            const conceptsData = await conceptsResponse.json();
            this.mathConcepts = conceptsData.mathConcepts;
        } catch (error) {
            throw new Error('Failed to load configuration files');
        }
    }

    renderTree() {
        // Render each section
        this.treeStructure.layers.forEach(layer => {
            this.renderSection(layer);
        });
    }

    renderSection(layer) {
        const sectionElement = document.getElementById(`${layer.id}-concepts`);
        if (!sectionElement) return;

        const concepts = this.mathConcepts[layer.id] || [];
        
        concepts.forEach(concept => {
            const conceptCard = this.createConceptCard(concept, layer);
            sectionElement.appendChild(conceptCard);
        });
    }

    createConceptCard(concept, layer) {
        const template = document.getElementById('concept-card-template');
        const card = template.content.cloneNode(true);
        
        const cardElement = card.querySelector('.concept-card');
        cardElement.setAttribute('data-concept-id', concept.id);
        cardElement.setAttribute('data-layer', layer.id);
        
        // Set content
        card.querySelector('.concept-title').textContent = concept.title;
        card.querySelector('.concept-brief').textContent = concept.description;
        card.querySelector('.grade-badge').textContent = concept.gradeLevel;
        card.querySelector('.duration-badge').textContent = concept.duration;
        
        // Set icon based on concept type
        const icon = this.getConceptIcon(concept);
        card.querySelector('.concept-icon').textContent = icon;
        
        // Set status
        const status = this.getConceptStatus(concept.id, layer.id);
        const statusElement = card.querySelector('.status-indicator');
        statusElement.textContent = status.text;
        statusElement.className = `status-indicator ${status.class}`;
        
        // Add click event if available
        if (status.class === 'available' || status.class === 'completed') {
            cardElement.addEventListener('click', () => this.openConceptModal(concept));
        } else {
            cardElement.style.opacity = '0.6';
            cardElement.style.cursor = 'not-allowed';
        }
        
        return card;
    }

    getConceptIcon(concept) {
        const iconMap = {
            'counting': '🔢',
            'shapes': '🔺',
            'addition-basic': '➕',
            'subtraction-basic': '➖',
            'patterns': '🔄',
            'measurement-intro': '📏',
            'place-value': '💯',
            'multiplication-intro': '✖️',
            'division-intro': '➗',
            'fractions-basic': '🍕',
            'geometry-2d': '📐',
            'decimals-intro': '💰',
            'data-graphs': '📊',
            'area-perimeter': '📦',
            'fractions-advanced': '🧮',
            'integers': '🌡️',
            'ratios-proportions': '⚖️',
            'percentages': '💯',
            'algebra-intro': '🔤',
            'geometry-3d': '🧊',
            'probability': '🎲',
            'statistics': '📈',
            'coordinate-plane': '🗺️',
            'linear-equations': '📉'
        };
        
        return iconMap[concept.id] || '📚';
    }

    getConceptStatus(conceptId, layerId) {
        const completed = this.userProgress.completed || [];
        const isCompleted = completed.includes(conceptId);
        
        if (isCompleted) {
            return { text: 'Completed ✓', class: 'completed' };
        }
        
        // Check if concept is unlocked
        const isUnlocked = this.isConceptUnlocked(conceptId, layerId);
        
        if (isUnlocked) {
            return { text: 'Available', class: 'available' };
        } else {
            return { text: 'Locked 🔒', class: 'locked' };
        }
    }

    isConceptUnlocked(conceptId, layerId) {
        // Always unlock roots concepts
        if (layerId === 'roots') return true;
        
        const completed = this.userProgress.completed || [];
        
        // For trunk concepts, check if enough root concepts are completed
        if (layerId === 'trunk') {
            const rootsCompleted = this.mathConcepts.roots.filter(concept => 
                completed.includes(concept.id)
            ).length;
            return rootsCompleted >= 4; // Need 4 roots concepts completed
        }
        
        // For branches concepts, check if enough trunk concepts are completed
        if (layerId === 'branches') {
            const trunkCompleted = this.mathConcepts.trunk.filter(concept => 
                completed.includes(concept.id)
            ).length;
            return trunkCompleted >= 6; // Need 6 trunk concepts completed
        }
        
        return false;
    }

    openConceptModal(concept) {
        const modal = document.getElementById('video-modal');
        const iframe = document.getElementById('video-iframe');
        
        // Set modal content
        document.getElementById('modal-title').textContent = concept.title;
        document.getElementById('concept-description').textContent = concept.description;
        document.getElementById('grade-level').textContent = `Grade: ${concept.gradeLevel}`;
        document.getElementById('duration').textContent = `Duration: ${concept.duration}`;
        
        // Set video URL (convert YouTube watch URL to embed URL)
        const videoId = this.extractYouTubeId(concept.videoUrl);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        iframe.src = embedUrl;
        
        // Set topics list
        const topicsList = document.getElementById('topics-list');
        topicsList.innerHTML = '';
        concept.topics.forEach(topic => {
            const li = document.createElement('li');
            li.textContent = topic;
            topicsList.appendChild(li);
        });
        
        // Setup complete button
        const completeBtn = document.getElementById('mark-complete');
        const isCompleted = this.userProgress.completed.includes(concept.id);
        completeBtn.textContent = isCompleted ? 'Completed ✓' : 'Mark as Complete';
        completeBtn.disabled = isCompleted;
        
        completeBtn.onclick = () => this.markConceptComplete(concept.id);
        
        // Show modal
        modal.style.display = 'block';
        this.currentModal = concept;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    markConceptComplete(conceptId) {
        if (!this.userProgress.completed.includes(conceptId)) {
            this.userProgress.completed.push(conceptId);
            this.saveUserProgress();
            this.updateProgressTracker();
            this.refreshConceptCards();
            
            // Update button
            const completeBtn = document.getElementById('mark-complete');
            completeBtn.textContent = 'Completed ✓';
            completeBtn.disabled = true;
            
            // Show congratulations
            this.showCongratulations(conceptId);
        }
    }

    showCongratulations(conceptId) {
        // Create a temporary congratulations message
        const congrats = document.createElement('div');
        congrats.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 1.2rem;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: bounceIn 0.5s ease;
        `;
        congrats.textContent = '🎉 Concept Completed! Great job! 🎉';
        
        document.body.appendChild(congrats);
        
        setTimeout(() => {
            congrats.remove();
        }, 3000);
    }

    refreshConceptCards() {
        // Clear existing cards
        ['roots', 'trunk', 'branches'].forEach(layerId => {
            const container = document.getElementById(`${layerId}-concepts`);
            container.innerHTML = '';
        });
        
        // Re-render tree
        this.renderTree();
    }

    updateProgressTracker() {
        const completed = this.userProgress.completed || [];
        
        ['roots', 'trunk', 'branches'].forEach(layerId => {
            const concepts = this.mathConcepts[layerId] || [];
            const completedCount = concepts.filter(concept => 
                completed.includes(concept.id)
            ).length;
            
            const progressElement = document.getElementById(`${layerId}-progress`);
            progressElement.textContent = `${completedCount}/${concepts.length}`;
            
            // Update progress item styling
            const progressItem = document.getElementById(`progress-${layerId}`);
            if (completedCount === concepts.length) {
                progressItem.style.background = '#e8f5e8';
                progressItem.style.borderColor = '#4CAF50';
            } else if (completedCount > 0) {
                progressItem.style.background = '#fff3e0';
                progressItem.style.borderColor = '#ff9800';
            }
        });
    }

    setupEventListeners() {
        // Close modal
        document.getElementById('close-modal').addEventListener('click', this.closeModal.bind(this));
        
        // Close modal when clicking outside
        document.getElementById('video-modal').addEventListener('click', (e) => {
            if (e.target.id === 'video-modal') {
                this.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
        
        // Favorite button (placeholder)
        document.getElementById('add-favorite').addEventListener('click', () => {
            alert('Favorites feature coming soon!');
        });
    }

    closeModal() {
        const modal = document.getElementById('video-modal');
        const iframe = document.getElementById('video-iframe');
        
        modal.style.display = 'none';
        iframe.src = ''; // Stop video
        this.currentModal = null;
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }

    loadUserProgress() {
        const saved = localStorage.getItem('tapmath-progress');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved progress');
            }
        }
        
        return {
            completed: [],
            favorites: [],
            lastAccessed: new Date().toISOString()
        };
    }

    saveUserProgress() {
        this.userProgress.lastAccessed = new Date().toISOString();
        localStorage.setItem('tapmath-progress', JSON.stringify(this.userProgress));
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: 600;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TapMathTree();
});

// Add bounce animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
        }
        70% {
            transform: translate(-50%, -50%) scale(0.9);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
`;
document.head.appendChild(style);
