import { Button, Container, Group, LoadingOverlay, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { createFormContext } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { forwardRef } from 'react';
import { z } from 'zod';
import { MainLayout } from '~/components/layout/Templates/MainLayout';
import { createTrpcServersideHelpers } from '~/server/api/helper';
import { getServerAuthSession } from '~/server/auth';
import { languages } from '~/tools/language';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { RouterOutputs, api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { updateSettingsValidationSchema } from '~/validations/user';

const PreferencesPage = () => {
  const { data } = api.user.withSettings.useQuery();
  const { data: boardsData } = api.boards.all.useQuery();
  const { t } = useTranslation('storage/common');
  const headTitle = `${t('metaTitle')}`;

  return (
    <MainLayout
      showExperimental
      contentComponents={
        <Button component="a" href="/board/" variant="light" leftIcon={<IconArrowLeft size={16} />}>
          {t('common:back')}
        </Button>
      }
    >
      <Container>
        <Paper p="xl" mih="100%" withBorder>
          <Head>
            <title>{headTitle}</title>
          </Head>
          <Title mb="xl">{t('pageTitle')}</Title>

          {data && boardsData && (
            <SettingsComponent settings={data.settings} boardsData={boardsData} />
          )}
        </Paper>
      </Container>
    </MainLayout>
  );
};

export const [FormProvider, useUserPreferencesFormContext, useForm] =
  createFormContext<z.infer<typeof updateSettingsValidationSchema>>();

const SettingsComponent = ({
  settings,
  boardsData,
}: {
  settings: RouterOutputs['user']['withSettings']['settings'];
  boardsData: RouterOutputs['boards']['all'];
}) => {
  const languagesData = languages.map((language) => ({
    label: language.originalName,
    description: language.translatedName,
    value: language.shortName,
    country: language.country,
  }));

  const { t, i18n } = useTranslation(['user/preferences', 'common']);

  const { i18nZodResolver } = useI18nZodResolver();
  const { pathname, query, asPath, push } = useRouter();


  return (
    <div className='iframe-container'>
        <iframe className='iframe-box' src='http://localhost:3000/manage' />
    </div>
  );
};




export const getServerSideProps: GetServerSideProps = async ({ req, res, locale }) => {
  const session = await getServerAuthSession({ req, res });
  if (!session) {
    return {
      notFound: true,
    };
  }

  const helpers = await createTrpcServersideHelpers({ req, res });

  await helpers.user.withSettings.prefetch();
  await helpers.boards.all.prefetch();

  const translations = await getServerSideTranslations(['storage/common'], locale, req, res);
  return {
    props: {
      ...translations,
      locale: locale,
      trpcState: helpers.dehydrate(),
    },
  };
};

export default PreferencesPage;
