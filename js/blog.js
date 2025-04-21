class BlogManager {
    constructor() {
        this.currentCategory = null;
        this.setupEventListeners();
        // Load the first category by default
        this.loadCategory('ML');
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
            const response = await fetch(`blog/${category}/posts.json`);
            const data = await response.json();
            this.displayPosts(data.posts, category);
        } catch (error) {
            console.error('Error loading posts:', error);
            this.displayError('Error loading posts for this category');
        }
    }

    displayPosts(posts, category) {
        const container = document.getElementById('posts-container');
        
        // Filter for published posts only
        const publishedPosts = posts.filter(post => post.published !== false);
        
        if (!publishedPosts || publishedPosts.length === 0) {
            container.innerHTML = '<p>No posts available in this category.</p>';
            return;
        }

        // Sort posts by date, newest first
        publishedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const postsHtml = publishedPosts.map(post => {
            const date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const slug = this.slugify(post.title);
            
            return `
                <div class="blog-post">
                    <h2><a href="post.html?category=${encodeURIComponent(category)}&slug=${slug}">${post.title}</a></h2>
                    <p class="blog-date">${date}</p>
                    <p>${post.summary}</p>
                    <a href="post.html?category=${encodeURIComponent(category)}&slug=${slug}" class="read-more">Read More →</a>
                </div>
            `;
        }).join('');

        container.innerHTML = postsHtml;
    }

    slugify(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    displayError(message) {
        const container = document.getElementById('posts-container');
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});