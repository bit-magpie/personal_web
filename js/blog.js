class BlogManager {
    constructor() {
        this.currentCategory = null;
        this.setupEventListeners();
        this.loadCategory('AI/ML'); // Load default category
    }

    setupEventListeners() {
        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.loadCategory(category);
                
                // Update active state
                document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    async loadCategory(category) {
        try {
            let folderPath;
            switch(category) {
                case 'AI/ML':
                    folderPath = 'blog/AL/ML/posts.json';
                    break;
                case 'Philosophy':
                    folderPath = 'blog/Philosophy/posts.json';
                    break;
                case 'Robotics':
                    folderPath = 'blog/Robotics/posts.json';
                    break;
                default:
                    throw new Error('Invalid category');
            }

            const response = await fetch(folderPath);
            const data = await response.json();
            this.displayPosts(data.posts);
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.displayError();
        }
    }

    displayPosts(posts) {
        const container = document.getElementById('posts-container');
        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = '<div class="blog-post"><p>No posts available in this category yet.</p></div>';
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            
            const date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p class="blog-date">${date}</p>
                <p>${post.summary}</p>
                <div class="blog-content">${post.content}</div>
            `;

            container.appendChild(postElement);
        });
    }

    displayError() {
        const container = document.getElementById('posts-container');
        container.innerHTML = '<div class="blog-post"><p>Error loading blog posts. Please try again later.</p></div>';
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});