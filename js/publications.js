class PublicationManager {
    constructor() {
        this.publications = [];
        this.presentations = [];
        this.loadPublications();
        this.loadPresentations();
        this.setupEventListeners();
    }

    async loadPublications() {
        try {
            const response = await fetch('js/publications.json');
            console.log('Fetching publications from:', 'js/publications.json');
            const data = await response.json();
            console.log('Loaded publications:', data);
            this.publications = data.publications;
            this.updateTotalCitations();
            this.renderPublications();
        } catch (error) {
            console.error('Error loading publications:', error);
        }
    }

    async loadPresentations() {
        try {
            const response = await fetch('js/presentations.json');
            const data = await response.json();
            this.presentations = data.presentations;
            this.sortPresentationsByDate();
            this.renderPresentations();
        } catch (error) {
            console.error('Error loading presentations:', error);
        }
    }

    sortPresentationsByDate() {
        // Function to parse different date formats
        const parseDate = (dateString) => {
            // Handle dates like "July 2021" or "2017" or "April 2022"
            const parts = dateString.split(' ');
            if (parts.length === 1) {
                // Just a year - e.g., "2017"
                return new Date(parseInt(parts[0]), 0, 1); // January 1st of that year
            } else {
                // Month and year - e.g., "July 2021"
                const month = new Date(Date.parse(parts[0] + " 1, 2000")).getMonth();
                const year = parseInt(parts[1]);
                return new Date(year, month, 1);
            }
        };

        // Sort presentations in reverse chronological order (newest first)
        this.presentations.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA; // Newest first
        });
    }

    updateTotalCitations() {
        const total = this.publications.reduce((sum, pub) => sum + (pub.citations || 0), 0);
        const totalCitationsElement = document.getElementById('totalCitationsValue');
        if (totalCitationsElement) {
            totalCitationsElement.textContent = `${total}`;
        }
    }

    setupEventListeners() {
        document.getElementById('sortByDate').addEventListener('click', () => {
            this.sortPublications('date');
        });

        document.getElementById('sortByCitations').addEventListener('click', () => {
            this.sortPublications('citations');
        });
    }

    sortPublications(criteria) {
        this.publications.sort((a, b) => {
            if (criteria === 'date') {
                return new Date(b.date) - new Date(a.date);
            } else if (criteria === 'citations') {
                return b.citations - a.citations;
            }
        });
        this.renderPublications();
    }

    renderPublications() {
        const table = document.querySelector('.publication-table');
        table.innerHTML = '';

        this.publications.forEach((pub, index) => {
            const row = document.createElement('tr');
            
            // Publication number
            const numCell = document.createElement('td');
            numCell.textContent = `[${index + 1}]`;
            
            // Publication details
            const detailsCell = document.createElement('td');
            const authors = pub.authors.join(', ');
            const title = pub.url !== '#' ? 
                `<a href="${pub.url}" target="_blank">${pub.title}</a>` : 
                pub.title;
            detailsCell.innerHTML = `${authors}. "${title}." ${pub.journal_name}.`;

            // Year
            const yearCell = document.createElement('td');
            yearCell.textContent = new Date(pub.date).getFullYear();

            // Citations
            const citationCell = document.createElement('td');
            citationCell.textContent = `${pub.citations}`;

            row.appendChild(numCell);
            row.appendChild(detailsCell);
            row.appendChild(yearCell);
            row.appendChild(citationCell);
            table.appendChild(row);
        });
    }

    renderPresentations() {
        const presentationsGrid = document.querySelector('.presentations-grid');
        if (!presentationsGrid) return;
        
        presentationsGrid.innerHTML = '';

        this.presentations.forEach(presentation => {
            const card = document.createElement('div');
            card.className = 'presentation-card';
            card.setAttribute('data-pdf', presentation.file);
            card.setAttribute('data-title', presentation.title);
            
            card.innerHTML = `
                <div class="presentation-info">
                    <h3 class="presentation-title">${presentation.title}</h3>
                    <p class="presentation-event">${presentation.event}</p>
                    <p class="presentation-date">${presentation.date}</p>
                </div>
            `;
            
            // Make the entire card clickable
            card.addEventListener('click', function() {
                const pdfFile = this.getAttribute('data-pdf');
                const title = this.getAttribute('data-title');
                window.location.href = `presentation-viewer.html?pdf=${encodeURIComponent(pdfFile)}&title=${encodeURIComponent(title)}`;
            });
            
            presentationsGrid.appendChild(card);
        });
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PublicationManager();
});