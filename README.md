# Xavier Lopez Portfolio

A modern, high-performance portfolio website for contemporary artist Xavier Lopez.

## Features

- **Animated Loading Sequence** - "Xavier Lopez" paints onto screen then shrinks to logo
- **Responsive Design** - Mobile-first layout that looks beautiful on all devices
- **Gallery with Filters** - Browse works by series (Creatures, Pop Icons, Studies)
- **Contact Form** - Direct messaging system wired to Xavier's email
- **Museum-Quality Aesthetics** - Ultra-polished, editorial-style design
- **Fast Performance** - Built with Next.js 14 for optimal speed

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel (recommended)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit `http://localhost:3000` to see the site.

## Deployment to Vercel

This project is optimized for Vercel deployment:

1. Push the code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Click "Deploy"
4. Your site will be live in seconds

Vercel will automatically detect Next.js and configure everything correctly.

## Customization

### Update Artwork Images
- Replace placeholder images in sections with actual artwork
- Update `page.tsx` image paths in the `flagshipWorks` array
- Images should be high-resolution (2400px+ width) for gallery display

### Update Contact Email
- Modify `xmanart77@gmail.com` in the contact section
- Integrate with email service (Resend, SendGrid) via `app/api/contact/route.ts`

### Add More Gallery Works
- Expand the `galleryWorks` array in `page.tsx`
- Add new series categories as needed

## Artist Contact

- **Email**: xmanart77@gmail.com
- **Phone**: +1 (804) 592-6328

---

Built with speed and artistry in mind. 🎨
