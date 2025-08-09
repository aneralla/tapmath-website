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
            console.error('Error loading data:', error);
            throw new Error('Failed to load configuration files');
        }
    }

    renderTree() {
        // Render each section on the SVG tree
        this.treeStructure.layers.forEach(layer => {
            this.renderTreeSection(layer);
        });
    }

    renderTreeSection(layer) {
        const svgGroup = document.getElementById(`${layer.id}-concepts-svg`);
        if (!svgGroup) return;

        const concepts = this.mathConcepts[layer.id] || [];
        const positions = this.getConceptPositions(layer.id, concepts.length);
        
        concepts.forEach((concept, index) => {
            const conceptNode = this.createConceptNode(concept, layer, positions[index]);
            svgGroup.appendChild(conceptNode);
        });
    }

    // --- helpers for layout -------------------------------------------------
    generateArcPositions(centerX, centerY, radiusX, radiusY, startDeg, endDeg, count, jitter = 0, baseRadius = 24) {
        if (count <= 0) return [];
        const toRad = (deg) => (deg * Math.PI) / 180;
        const positions = [];
        const total = Math.max(1, count - 1);
        const start = toRad(startDeg);
        const end = toRad(endDeg);
        const step = (end - start) / total;
        for (let i = 0; i < count; i++) {
            const angle = start + step * i;
            let x = centerX + radiusX * Math.cos(angle);
            let y = centerY + radiusY * Math.sin(angle);
            if (jitter > 0) {
                x += (Math.random() * 2 - 1) * jitter;
                y += (Math.random() * 2 - 1) * jitter;
            }
            positions.push({ x, y, radius: baseRadius });
        }
        return positions;
    }

    generateTrunkPositions(centerX, startY, endY, count) {
        const positions = [];
        const total = Math.max(1, count - 1);
        const step = (startY - endY) / total;
        for (let i = 0; i < count; i++) {
            const y = startY - step * i;
            const side = i % 2 === 0 ? -1 : 1;
            const horizontalOffset = 70 + (i % 3) * 15; // spread further out from trunk
            const x = centerX + side * horizontalOffset + (Math.random() * 8 - 4);
            positions.push({ x, y: y + (Math.random() * 8 - 4), radius: 24 });
        }
        return positions;
    }

    // -----------------------------------------------------------------------
    getConceptPositions(layerId, conceptCount) {
        if (layerId === 'roots') {
            // Position along the realistic root system paths
            const rootPositions = [
                { x: 250, y: 750 }, { x: 350, y: 760 }, { x: 450, y: 740 },
                { x: 550, y: 740 }, { x: 650, y: 760 }, { x: 750, y: 750 }
            ];
            return rootPositions.slice(0, conceptCount).map(pos => ({ ...pos, radius: 26 }));
        }
        
        if (layerId === 'trunk') {
            // Position around the thicker trunk with more spacing
            const trunkPositions = [
                { x: 420, y: 680 }, { x: 580, y: 670 }, { x: 410, y: 620 }, { x: 590, y: 610 },
                { x: 425, y: 560 }, { x: 575, y: 570 }, { x: 415, y: 500 }, { x: 585, y: 510 }
            ];
            return trunkPositions.slice(0, conceptCount).map(pos => ({ ...pos, radius: 26 }));
        }
        
        if (layerId === 'branches') {
            // Position throughout the fluffy foliage clusters with better spacing
            const branchPositions = [
                // Outer large clusters
                { x: 250, y: 220 }, { x: 750, y: 220 },
                // Main central clusters
                { x: 400, y: 180 }, { x: 600, y: 180 }, { x: 500, y: 160 },
                // Secondary clusters  
                { x: 320, y: 260 }, { x: 680, y: 260 }, { x: 450, y: 240 }, { x: 550, y: 240 },
                // Additional spread positions
                { x: 370, y: 210 }
            ];
            return branchPositions.slice(0, conceptCount).map(pos => ({ ...pos, radius: 24 }));
        }
        
        return [];
    }

    createConceptNode(concept, layer, position) {
        const svgNS = "http://www.w3.org/2000/svg";
        
        // Create group element for the concept node
        const group = document.createElementNS(svgNS, 'g');
        group.classList.add('concept-node');
        group.setAttribute('data-concept-id', concept.id);
        group.setAttribute('data-layer', layer.id);
        
        // Set status
        const status = this.getConceptStatus(concept.id, layer.id);
        group.classList.add(status.class);
        
        // Calculate dynamic radius based on text length with better proportions
        const baseRadius = position.radius;
        const titleLength = concept.title.length;
        const dynamicRadius = Math.max(baseRadius, Math.min(titleLength * 1.5 + 12, baseRadius + 10));
        
        // Create circle background
        const circle = document.createElementNS(svgNS, 'circle');
        circle.classList.add('concept-circle');
        circle.setAttribute('cx', position.x);
        circle.setAttribute('cy', position.y);
        circle.setAttribute('r', dynamicRadius);
        
        // Set circle fill based on layer
        let fillColor = '#ffffff';
        if (layer.id === 'roots') fillColor = '#FFF8DC';
        else if (layer.id === 'trunk') fillColor = '#F4E4BC';
        else if (layer.id === 'branches') fillColor = '#F0FFF0';
        
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', '#4CAF50');
        circle.setAttribute('stroke-width', '2');
        
        // Create icon text - positioned in upper part of circle
        const icon = this.getConceptIcon(concept);
        const iconText = document.createElementNS(svgNS, 'text');
        iconText.classList.add('concept-icon-svg');
        iconText.setAttribute('x', position.x);
        iconText.setAttribute('y', position.y - 6);
        iconText.textContent = icon;
        
        // Create title text with better wrapping - positioned in lower part
        const titleText = document.createElementNS(svgNS, 'text');
        titleText.classList.add('concept-title-svg');
        titleText.setAttribute('x', position.x);
        titleText.setAttribute('y', position.y + dynamicRadius - 8);
        
        // Smart text truncation based on circle size
        let shortTitle = concept.title;
        const maxChars = Math.floor(dynamicRadius / 2.5);
        if (shortTitle.length > maxChars) {
            shortTitle = shortTitle.substring(0, maxChars - 3) + '...';
        }
        titleText.textContent = shortTitle;
        
        // Create multi-line text if needed for longer titles
        if (concept.title.length > 15 && dynamicRadius > 30) {
            const words = concept.title.split(' ');
            const midPoint = Math.ceil(words.length / 2);
            const firstLine = words.slice(0, midPoint).join(' ');
            const secondLine = words.slice(midPoint).join(' ');
            
            if (firstLine.length <= maxChars && secondLine.length <= maxChars) {
                titleText.textContent = firstLine;
                
                const titleText2 = document.createElementNS(svgNS, 'text');
                titleText2.classList.add('concept-title-svg');
                titleText2.setAttribute('x', position.x);
                titleText2.setAttribute('y', position.y + dynamicRadius - 4);
                titleText2.textContent = secondLine;
                group.appendChild(titleText2);
            }
        }
        
        // Add elements to group
        group.appendChild(circle);
        group.appendChild(iconText);
        group.appendChild(titleText);
        
        // Add click event if available
        if (status.class === 'available' || status.class === 'completed') {
            group.style.cursor = 'pointer';
            group.addEventListener('click', () => this.selectConcept(concept));
            group.addEventListener('dblclick', () => this.openConceptModal(concept));
        }
        
        return group;
    }

    selectConcept(concept) {
        // Update the concept details panel
        document.getElementById('panel-title').textContent = concept.title;
        document.getElementById('panel-description').textContent = concept.description;
        
        const metaPanel = document.getElementById('panel-meta');
        metaPanel.innerHTML = `
            <span class="grade-badge">Grade: ${concept.gradeLevel}</span>
            <span class="duration-badge">Duration: ${concept.duration}</span>
        `;
        
        // Add a "Watch Video" button
        const watchButton = document.createElement('button');
        watchButton.textContent = '🎥 Watch Video';
        watchButton.className = 'btn-complete';
        watchButton.style.marginTop = '10px';
        watchButton.addEventListener('click', () => this.openConceptModal(concept));
        metaPanel.appendChild(watchButton);
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
        // Check if unlock system is disabled
        if (!this.treeStructure.progression.unlockSystem) {
            return true; // All concepts unlocked when system is disabled
        }
        
        // Always unlock roots concepts
        if (layerId === 'roots') return true;
        
        // Check if prerequisite checking is disabled
        if (!this.treeStructure.progression.prerequisiteCheck) {
            return true; // All concepts unlocked when prerequisite check is disabled
        }
        
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
            this.refreshConceptNodes();
            
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

    refreshConceptNodes() {
        // Clear existing nodes
        ['roots', 'trunk', 'branches'].forEach(layerId => {
            const container = document.getElementById(`${layerId}-concepts-svg`);
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
