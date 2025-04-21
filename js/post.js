class PostManager {
    constructor() {
        this.configureMarked();
        this.loadPost();
        this.contentRenderers = {
            'markdown': this.renderMarkdown.bind(this),
            'html': this.renderHtml.bind(this),
            'notebook': this.renderNotebook.bind(this)
        };
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

            // Check if post is published
            if (post.published === false) {
                this.displayError('This post is not yet published');
                return;
            }

            // Update page title
            document.title = `${post.title} - Isuru Jayarathne`;

            // Prepare the header
            const date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const container = document.getElementById('post-content');
            container.innerHTML = `
                <div class="post-header">
                    <h1>${post.title}</h1>
                    <p class="blog-date">${date}</p>
                </div>
                <div class="post-body">
                    <div id="post-content-body"></div>
                </div>
            `;

            // Use the appropriate renderer based on content type
            const contentType = post.contentType || 'markdown'; // Default to markdown for backward compatibility
            const renderer = this.contentRenderers[contentType];
            
            if (!renderer) {
                throw new Error(`Unsupported content type: ${contentType}`);
            }

            await renderer(post, folderPath);

        } catch (error) {
            console.error('Error loading post:', error);
            this.displayError('Error loading the blog post');
        }
    }

    async renderMarkdown(post, folderPath) {
        // Load the markdown file
        const mdResponse = await fetch(`${folderPath}/posts/${post.filename}`);
        if (!mdResponse.ok) {
            throw new Error('Markdown file not found');
        }
        
        const markdown = await mdResponse.text();
        const contentHtml = marked.parse(markdown);
        
        const contentContainer = document.getElementById('post-content-body');
        contentContainer.innerHTML = contentHtml;

        // Initialize syntax highlighting for code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }

    async renderHtml(post, folderPath) {
        // Load the HTML file
        const htmlResponse = await fetch(`${folderPath}/posts/${post.filename}`);
        if (!htmlResponse.ok) {
            throw new Error('HTML file not found');
        }
        
        const html = await htmlResponse.text();
        const contentContainer = document.getElementById('post-content-body');
        contentContainer.innerHTML = html;
    }

    async renderNotebook(post, folderPath) {
        try {
            const response = await fetch(`${folderPath}/posts/${post.filename}`);
            if (!response.ok) {
                throw new Error('Notebook file not found');
            }
            
            const notebook = await response.json();
            const contentContainer = document.getElementById('post-content-body');
            let htmlContent = '';
            
            // Render each cell
            notebook.cells.forEach((cell, index) => {
                if (cell.cell_type === 'markdown') {
                    htmlContent += `<div class="notebook-cell markdown-cell">
                        ${marked.parse(cell.source.join(''))}
                    </div>`;
                } else if (cell.cell_type === 'code') {
                    const code = cell.source.join('');
                    htmlContent += `<div class="notebook-cell code-cell">
                        <div class="code-header">Code</div>
                        <pre><code class="python">${this.escapeHtml(code)}</code></pre>`;
                    
                    // Handle outputs if they exist
                    if (cell.outputs && cell.outputs.length > 0) {
                        htmlContent += '<div class="code-output">';
                        cell.outputs.forEach(output => {
                            if (output.output_type === 'stream') {
                                // Text output
                                htmlContent += `<pre class="output-text">${this.escapeHtml(output.text.join(''))}</pre>`;
                            } else if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
                                // Handle various MIME types
                                if (output.data['image/png']) {
                                    // PNG image output
                                    htmlContent += `<img src="data:image/png;base64,${output.data['image/png']}" class="output-image" alt="Plot output">`;
                                } else if (output.data['image/jpeg']) {
                                    // JPEG image output
                                    htmlContent += `<img src="data:image/jpeg;base64,${output.data['image/jpeg']}" class="output-image" alt="Plot output">`;
                                } else if (output.data['text/html']) {
                                    // HTML output
                                    htmlContent += `<div class="output-html">${output.data['text/html'].join('')}</div>`;
                                } else if (output.data['text/plain']) {
                                    // Plain text output
                                    htmlContent += `<pre class="output-text">${this.escapeHtml(output.data['text/plain'].join(''))}</pre>`;
                                }
                            } else if (output.output_type === 'error') {
                                // Error output
                                htmlContent += `<pre class="output-error">${this.escapeHtml(output.traceback.join('\n'))}</pre>`;
                            }
                        });
                        htmlContent += '</div>';
                    }
                    
                    htmlContent += '</div>';
                }
            });
            
            contentContainer.innerHTML = htmlContent;

            // Apply syntax highlighting to code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        } catch (error) {
            console.error('Error rendering notebook:', error);
            this.displayError('Error loading the notebook');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderIframe(post, folderPath) {
        const contentContainer = document.getElementById('post-content-body');
        contentContainer.innerHTML = `
            <iframe 
                src="${post.url || `${folderPath}/posts/${post.filename}`}"
                style="width: 100%; height: ${post.height || '600px'}; border: none;"
                allowfullscreen>
            </iframe>
        `;
    }

    slugify(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    displayError(message) {
        const container = document.getElementById('post-content');
        container.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <p><a href="blog.html">Return to Blog</a></p>
            </div>
        `;
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PostManager();
});