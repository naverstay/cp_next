import './../src/styles/app.scss'

import { Provider } from 'jotai'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import React from 'react'

// import Manifest from './site.webmanifest.json'

import Layout from '@/components/Layout/layout'

// import '!file-loader?name=[name].[ext]!./favicon.ico'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon.png'
//
// import '!file-loader?name=[name].[ext]!./browserconfig.xml'
// import '!file-loader?name=[name].[ext]!./favicon-16x16.png'
// import '!file-loader?name=[name].[ext]!./favicon-32x32.png'
// import '!file-loader?name=[name].[ext]!./safari-pinned-tab.svg'

// import '!file-loader?name=[name].[ext]!./mstile-150x150.png'

// import '!file-loader?name=[name].[ext]!./apple-touch-icon-152x152.png'
// import '!file-loader?name=[name].[ext]!./android-chrome-192x192.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-60x60.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-144x144.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-120x120.png'

// import '!file-loader?name=[name].[ext]!./apple-touch-icon-precomposed.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-76x76.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-72x72.png'
// import '!file-loader?name=[name].[ext]!./android-chrome-256x256.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-57x57.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-180x180.png'
// import '!file-loader?name=[name].[ext]!./apple-touch-icon-114x114.png'

// import 'file-loader?name=.htaccess!./.htaccess'

function MyApp({ Component, pageProps }: AppProps) {
  const { initialState } = pageProps

  console.log('initialState', pageProps)

  return (
    <React.Fragment>
      <Head>
        <base href="/" />

        <meta charSet="utf-8" />

        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#475df4" />

        <link rel="icon" href="./favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
        {/*<Manifest rel="manifest" href="./site.webmanifest.json" crossOrigin="use-credentials" />*/}

        <link rel="mask-icon" href="./safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>

      {/*      <Script*/}
      {/*        id="window_dl_script"*/}
      {/*        dangerouslySetInnerHTML={{*/}
      {/*          __html: `*/}
      {/*window.dataLayer = window.dataLayer || [];*/}
      {/*window.gTag = (dl) => {*/}
      {/*  window.dataLayer.push(dl);*/}
      {/*}*/}
      {/*  `,*/}
      {/*        }}*/}
      {/*      />*/}

      {/*      <Script*/}
      {/*        id="gtm_script"*/}
      {/*        dangerouslySetInnerHTML={{*/}
      {/*          __html: `*/}
      {/*(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':*/}
      {/*new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],*/}
      {/*j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=*/}
      {/*'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);*/}
      {/*})(window,document,'script','dataLayer','GTM-WVWK2SW');              */}
      {/*              `,*/}
      {/*        }}*/}
      {/*      />*/}

      <Provider initialValues={initialState}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </React.Fragment>
  )
}

export default MyApp
