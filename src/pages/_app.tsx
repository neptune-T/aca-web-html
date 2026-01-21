import '@/styles/globals.css'
import 'katex/dist/katex.min.css';
import type { AppProps } from 'next/app'
import Head from 'next/head';
import { withBasePath } from '@/lib/basePath';
import { ThemeProvider } from '@/context/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* 默认元信息：具体页面可在各自的 <Head> 中覆盖 */}
        <meta name="description" content="A collection of thoughts, explorations, and research in Generative AI, Mathematics, and Physics." />
        <meta property="og:description" content="Explore notes, papers, and more." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content={withBasePath('/favicon.ico')} />
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default MyApp; 