class BlogManager {
    constructor() {
        this.currentCategory = null;
        this.allPosts = [];
        this.setupEventListeners();
        // Load all categories at startup
        this.loadAllCategories();
    }

    setupEventListeners() {
        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.displayPostsFromCategory(category);

                // Update active state
                document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Add search event listeners
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');

        searchButton.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    async loadAllCategories() {
        try {
            const categories = ['ML', 'Philosophy', 'Robotics'];
            this.allPosts = [];

            for (const category of categories) {
                const response = await fetch(`blog/${category}/posts.json`);
                const data = await response.json();
                // Add category information to each post
                const postsWithCategory = data.posts.map(post => ({
                    ...post,
                    category: category
                }));
                this.allPosts = [...this.allPosts, ...postsWithCategory];
            }

            // Display ML category by default
            this.displayPostsFromCategory('ML');
        } catch (error) {
            console.error('Error loading posts:', error);
            this.displayError('Error loading posts');
        }
    }

    displayPostsFromCategory(category) {
        const categoryPosts = this.allPosts.filter(post => post.category === category);
        this.displayPosts(categoryPosts);
    }

    handleSearch() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        if (!searchTerm) {
            // If search is empty, show current category
            const activeCategory = document.querySelector('.category-link.active');
            if (activeCategory) {
                this.displayPostsFromCategory(activeCategory.dataset.category);
            }
            return;
        }

        const searchResults = this.allPosts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const summaryMatch = post.summary.toLowerCase().includes(searchTerm);
            const categoryMatch = post.category.toLowerCase().includes(searchTerm);
            return titleMatch || summaryMatch || categoryMatch;
        });

        this.displayPosts(searchResults, true);
    }

    displayPosts(posts, isSearchResult = false) {
        const container = document.getElementById('posts-container');
        
        // Filter for published posts only
        const publishedPosts = posts.filter(post => post.published !== false);
        
        if (!publishedPosts || publishedPosts.length === 0) {
            container.innerHTML = isSearchResult ? 
                '<p>No posts found matching your search.</p>' : 
                '<p>No posts available in this category.</p>';
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
                    <h2><a href="post.html?category=${encodeURIComponent(post.category)}&slug=${slug}">${post.title}</a></h2>
                    <p class="blog-date">${date} - ${post.category}</p>
                    <p>${post.summary}</p>
                    <a href="post.html?category=${encodeURIComponent(post.category)}&slug=${slug}" class="read-more">Read More →</a>
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