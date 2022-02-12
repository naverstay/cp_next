import './../src/styles/app.scss';

import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import Layout from '@/components/Layout/layout';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <Layout history={router}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
