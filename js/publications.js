class PublicationManager {
    constructor() {
        this.publications = [];
        this.loadPublications();
        this.setupEventListeners();
    }

    async loadPublications() {
        try {
            const response = await fetch('js/publications.json');
            console.log('Fetching publications from:', 'js/publications.json');
            const data = await response.json();
            console.log('Loaded publications:', data);
            this.publications = data.publications;
            this.renderPublications();
        } catch (error) {
            console.error('Error loading publications:', error);
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
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PublicationManager();
});