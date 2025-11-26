import '@/styles/globals.css'
import 'katex/dist/katex.min.css';
import type { AppProps } from 'next/app'
import Head from 'next/head';
import Layout from '@/components/Layout';
import { ThemeProvider } from '@/context/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>My Personal Website</title>
        <meta name="description" content="A collection of thoughts, explorations, and research in Generative AI, Mathematics, and Physics." />
        <meta property="og:title" content="My Personal Website" />
        <meta property="og:description" content="Explore notes, papers, and more." />
        <meta property="og:image" content="/favicon.ico" /> {/* 更新为实际图像 */}
        <meta property="og:url" content="https://your-site.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ThemeProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  )
}

export default MyApp; 