interface PDFOptions {
    filename: string
    userName: string
    userEmail: string
    wpm: number
    accuracy: number
    totalWords: number
    totalTests: number
    level: number
    rank: string
}

export async function generatePDF(element: HTMLElement, options: PDFOptions) {

    try {
        // Dynamic import to avoid SSR issues
        const html2canvas = (await import("html2canvas")).default
        const jsPDF = (await import("jspdf")).default


        // Ensure element is visible and has dimensions
        if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
            throw new Error('Element is not visible or has no dimensions')
        }


        // Convert HTML element to canvas with better options
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: element.offsetWidth,
            height: element.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            // Add logging and fix for modern CSS colors
            onclone: (clonedDoc) => {

                // Fix for modern CSS color functions (oklch, etc.)
                const style = clonedDoc.createElement('style')
                style.textContent = `
                    * {
                        /* Replace any modern color functions with fallback colors */
                        background-color: var(--fallback-bg, inherit) !important;
                        color: var(--fallback-text, inherit) !important;
                        border-color: var(--fallback-border, inherit) !important;
                    }
                    
                    /* Specific overrides for common Tailwind classes */
                    .bg-white { background-color: #ffffff !important; }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    .bg-gray-800 { background-color: #1f2937 !important; }
                    .bg-gray-900 { background-color: #111827 !important; }
                    .bg-green-500 { background-color: #10b981 !important; }
                    .bg-green-600 { background-color: #059669 !important; }
                    .text-white { color: #ffffff !important; }
                    .text-black { color: #000000 !important; }
                    .text-gray-600 { color: #4b5563 !important; }
                    .text-gray-800 { color: #1f2937 !important; }
                    .text-green-600 { color: #059669 !important; }
                    .border-green-500 { border-color: #10b981 !important; }
                    .border-green-300 { border-color: #6ee7b7 !important; }
                    .border-gray-400 { border-color: #9ca3af !important; }
                `
                clonedDoc.head.appendChild(style)
            }
        })


        // Create PDF
        const imgData = canvas.toDataURL("image/png")

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        })

        // Calculate dimensions to fit the page
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = (pdfHeight - imgHeight * ratio) / 2

        console.log('PDF dimensions calculated:', {
            pdfWidth,
            pdfHeight,
            ratio,
            imgX,
            imgY
        })

        // Add image to PDF
        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
        console.log('Image added to PDF')

        // Save the PDF
        pdf.save(options.filename)
        console.log('PDF saved with filename:', options.filename)

        return true
    } catch (error) {
        console.error("Error generating PDF:", error)

        // More specific error handling
        if (error instanceof Error) {
            if (error.message.includes('html2canvas')) {
                throw new Error("Failed to convert certificate to image. Please try again.")
            } else if (error.message.includes('jsPDF')) {
                throw new Error("Failed to create PDF. Please check your browser compatibility.")
            }
        }

        throw new Error(`Failed to generate PDF certificate: ${error}`)
    }
}