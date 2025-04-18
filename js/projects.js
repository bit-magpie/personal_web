async function loadProjects() {
    try {
        const response = await fetch('js/projects.json');
        const data = await response.json();
        displayProjects(data.projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function displayProjects(projects) {
    const projectSection = document.querySelector('.section');
    const projectsContainer = document.createElement('div');
    projectsContainer.className = 'projects-container';

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'project-image-container';
        
        if (project.image) {
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.title;
            img.className = 'project-image';
            imageContainer.appendChild(img);
        } else {
            const placeholder = document.createElement('i');
            placeholder.className = 'fas fa-code project-image-placeholder';
            imageContainer.appendChild(placeholder);
        }
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'project-content-wrapper';
        
        const content = document.createElement('div');
        content.className = 'project-card-content';
        
        const techList = project.technologies.join(', ');
        
        content.innerHTML = `
            <h3>${project.title}</h3>
            <p class="project-date">Year: ${project.date}</p>
            <p>${project.description}</p>
            <p><strong>Technologies:</strong> ${techList}</p>
        `;
        
        contentWrapper.appendChild(content);

        if (project.url) {
            const link = document.createElement('a');
            link.href = project.url;
            link.className = 'project-link';
            link.target = '_blank';
            link.textContent = 'View Project';
            contentWrapper.appendChild(link);
        }
        
        projectCard.appendChild(imageContainer);
        projectCard.appendChild(contentWrapper);
        projectsContainer.appendChild(projectCard);
    });

    // Clear existing project cards and append new ones
    while (projectSection.children.length > 1) {
        projectSection.removeChild(projectSection.lastChild);
    }
    projectSection.appendChild(projectsContainer);
}

document.addEventListener('DOMContentLoaded', loadProjects);