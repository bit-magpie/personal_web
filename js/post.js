class PostManager {
    constructor() {
        this.configureMarked();
        this.loadPost();
    }

    configureMarked() {
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });
    }

    async loadPost() {
        try {
            const params = new URLSearchParams(window.location.search);
            const category = params.get('category');
            const slug = params.get('slug');

            if (!category || !slug) {
                this.displayError('Invalid post URL');
                return;
            }

            let folderPath;
            switch(category) {
                case 'ML':
                    folderPath = 'blog/ML';
                    break;
                case 'Philosophy':
                    folderPath = 'blog/Philosophy';
                    break;
                case 'Robotics':
                    folderPath = 'blog/Robotics';
                    break;
                default:
                    throw new Error('Invalid category');
            }

            // First load the posts.json to get metadata
            const jsonResponse = await fetch(`${folderPath}/posts.json`);
            const data = await jsonResponse.json();
            const post = data.posts.find(p => this.slugify(p.title) === slug);

            if (!post) {
                this.displayError('Post not found');
                return;
            }

            // Load the markdown file using the filename from posts.json
            const mdResponse = await fetch(`${folderPath}/posts/${post.filename}`);
            if (!mdResponse.ok) {
                throw new Error('Markdown file not found');
            }
            
            const markdown = await mdResponse.text();

            // Update page title
            document.title = `${post.title} - Isuru Jayarathne`;

            // Render the post
            const contentHtml = marked.parse(markdown);
            const container = document.getElementById('post-content');
            
            const date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            container.innerHTML = `
                <div class="post-header">
                    <h1>${post.title}</h1>
                    <p class="blog-date">${date}</p>
                </div>
                <div class="post-body">
                    ${contentHtml}
                </div>
            `;

            // Initialize syntax highlighting for code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        } catch (error) {
            console.error('Error loading post:', error);
            this.displayError('Error loading the blog post');
        }
    }

    slugify(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    displayError(message) {
        const container = document.getElementById('post-content');
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PostManager();
});