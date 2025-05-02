// PDF.js global variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = null;
let ctx = null;
let currentPdfUrl = '';

// Parse query parameters to get the PDF file path
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Initialize PDF viewer
function initPdfViewer() {
    canvas = document.getElementById('pdfViewer');
    ctx = canvas.getContext('2d');
    
    const pdfUrl = getQueryParam('pdf');
    const title = getQueryParam('title');
    
    if (title) {
        document.getElementById('presentationTitle').textContent = decodeURIComponent(title);
        document.title = `${decodeURIComponent(title)} - Presentation`;
    }
    
    if (!pdfUrl) {
        displayError('No PDF specified');
        return;
    }
    
    // Set the PDF URL for the "Open in new tab" link
    currentPdfUrl = `presentations/${pdfUrl}`;
    const openPdfLink = document.getElementById('openPdfLink');
    if (openPdfLink) {
        openPdfLink.href = currentPdfUrl;
    }
    
    // Set up PDF.js worker
    // Using the CDN version of PDF.js already loaded in HTML
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    
    // Load the PDF
    loadPdf(currentPdfUrl);
    
    // Set up button handlers
    document.getElementById('prevBtn').addEventListener('click', onPrevPage);
    document.getElementById('nextBtn').addEventListener('click', onNextPage);
    
    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'n') {
            onNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'p') {
            onPrevPage();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (pdfDoc) {
            queueRenderPage(pageNum);
        }
    });
}

// Load PDF from URL
function loadPdf(url) {
    // Load the PDF document
    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        pdfDoc = pdf;
        document.getElementById('pageInfo').textContent = `Page ${pageNum} of ${pdf.numPages}`;
        
        // Initial render of the first page
        renderPage(pageNum);
    }).catch(function(error) {
        console.error('Error loading PDF:', error);
        displayError('Failed to load the PDF. Please check if the file exists and try again.');
    });
}

// Render a specific page
function renderPage(num) {
    pageRendering = true;
    
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale });
        
        // Adjust canvas dimensions to the viewport while preserving aspect ratio
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        // Calculate the scale to fit the page width within the container
        // This preserves the aspect ratio
        const scaleFactor = containerWidth / viewport.width;
        const adjustedViewport = page.getViewport({ scale: scale * scaleFactor });
        
        // Set canvas dimensions to match the adjusted viewport
        canvas.height = adjustedViewport.height;
        canvas.width = adjustedViewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: adjustedViewport
        };
        
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(function() {
            pageRendering = false;
            
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    
    document.getElementById('pageInfo').textContent = `Page ${num} of ${pdfDoc.numPages}`;
}

// Queue a page for rendering
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Display previous page
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Display next page
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Display error message
function displayError(message) {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width/2, canvas.height/2);
}

// Initialize the viewer when the document is loaded
document.addEventListener('DOMContentLoaded', initPdfViewer);