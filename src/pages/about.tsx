import { PageProps, graphql } from 'gatsby';
import React from 'react';

import Profile from '~/components/Profile';
import Seo from '~/components/Seo';
import { useSeo } from '~/hooks/useSeo';
import Layout from '~/layout';

const AboutPage = ({ data, location }: PageProps<GatsbyTypes.AboutPageQuery>) => {
  const siteMetadata = useSeo().site?.siteMetadata;

  const siteUrl = data.site?.siteMetadata?.siteUrl ?? '';
  const siteTitle = data.site?.siteMetadata?.title ?? '';
  const siteThumbnail = data.site?.siteMetadata?.thumbnail;

  const meta: Metadata[] = [];
  if (siteThumbnail) {
    const properties = ['og:image', 'twitter:image'];

    for (const property of properties) {
      meta.push({
        property,
        content: `${siteUrl}${siteThumbnail}`,
      });
    }
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        lang='en'
        title={siteMetadata?.title ?? ''}
        description={siteMetadata?.description ?? ''}
        meta={meta}
        noSiteName
      />
      <Profile />
      <h1>I am</h1>
      <p>테스트 테스트</p>
      <p>테스트 테스트</p>
    </Layout>
  );
};

export default AboutPage;

export const pageQuery = graphql`
  query AboutPage {
    site {
      siteMetadata {
        title
        siteUrl
        thumbnail
      }
    }
  }
`;
