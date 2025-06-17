import '@/styles/globals.css'
import 'katex/dist/katex.min.css';
import type { AppProps } from 'next/app'
import Layout from '@/components/Layout';
import Header from '@/components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Header />
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp; 