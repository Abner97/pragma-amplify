import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { type Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
//@ts-ignore
import { env } from '$amplify/env/post-confirmation';
import { createUser } from './graphql/mutations';

Amplify.configure(
  {
    API: {
      GraphQL: {
        endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT,
        region: env.AWS_REGION,
        defaultAuthMode: 'apiKey',
      },
    },
  },
  {
    Auth: {
      credentialsProvider: {
        getCredentialsAndIdentityId: async () => ({
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            sessionToken: env.AWS_SESSION_TOKEN,
          },
        }),
        clearCredentialsAndIdentityId: () => {
          /* noop */
        },
      },
    },
  }
);

const client = generateClient<Schema>({
  authMode: 'iam',
});

export const handler: PostConfirmationTriggerHandler = async (event) => {
  await client
    .graphql({
      query: createUser,
      variables: {
        input: {
          id: event.request.userAttributes.sub,
          email: event.request.userAttributes.email,
          name: event.request.userAttributes.name,
        },
      },
    })
    .catch((error) => console.error(error));

  return event;
};
