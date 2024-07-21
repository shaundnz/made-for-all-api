<div align="center">
<h3 align="center">MadeForAll</h3>

  <p align="center">
    Remove Spotify's excessive customization of playlists to find more music you haven't heard before. 
    <br />
    <a href="https://madeforall.shaundnz.com/"><strong>View Demo</strong></a>
    <br />
    <br />
    <a href="https://github.com/shaundnz/made-for-all-client">Client Repository</a>
    ·
    <a href="https://github.com/shaundnz/made-for-all-api">API Repository</a>
  </p>
</div>

## About The Project

Spotify's "Made For You" feature can make it hard to find new music in its curated playlists, or radio playlists, especially in genres that you already listen to a lot. MadeForAll removes this customization by getting the base version of Spotify playlists and makes them easily accessible through a UI.

The app has a fully fleshed out CI/CD pipeline that deploys PR changes to a test environment, and all merges to main deploy to the prod environment.

<table>
  <tr>
    <td>Landing Page</td>
     <td>All Tracked Playlists Page</td>
  </tr>
  <tr>
    <td><img alt="Landing Page" src="https://i.imgur.com/eUlN5kq.png"></td>
    <td><img alt="All Tracked Playlists Page" src="https://i.imgur.com/FAmsF7y.png"></td>

  </tr>
 </table>

### Built With

- [![Aws][Aws]][Aws-url]
- [![React][React.js]][React-url]
- [![AWS Lambda][Aws-lambda]][Aws-lambda-url]
- [![API Gateway][Api-gateway]][Api-gateway-url]
- [![GitHubActions][Github-actions]][Github-actions-url]
- [![Vite][Vite.js]][Vite-url]
- [![Playwright][Playwright.js]][Playwright-url]
- [![Spotify API][Spotify.js]][Spotify-url]

## Architecture

![AWS architecture diagram for MadeForAll](https://i.imgur.com/TRnTDRH.png)

## Deployment Pipelines

#### Deployment Environments Targets:

- Local dev - `dev`
- On PR - `test`
- On merge main - `prod`

### Client

![MadeForAll client deployment pipeline](https://i.imgur.com/OnKaqJV.png)

### Lambda API

![MadeForAll API deployment pipeline](https://i.imgur.com/CjBxZVf.png)

## Additional Notes

### Motivations

Using the Spotify API to get uncustomized playlists was something I had on my mind for a while once I noticed I was getting frustrated with the lack of new music I was getting in the "Made for you" Spotify playlists, and the fact that there isn't a way to turn the feature off despite multiple requests for it on the forums.

I challenged myself to deploy the app fully with the CDK, and make reusable CI/CD pipelines that target multiple different environment, closer resembling a real production system. The only manual configuration for each environment in AWS was creating the SSL certificates and DNS records. I saw the benefits of IaC as it keeps the configuration managed centrally and allows consistent reusable deployments across different environments. This consistency helps prevents issues between environments and ensure test envs closer resemble prod.

The client is heavily based on the architecture and technologies of [Bulletproof React](https://github.com/alan2207/bulletproof-react) - A sample project showcasing modern best practices with React to build simple and scalable applications. This app uses a very strict linter to adhere to best practices, [Husky](https://kentcdodds.com/blog/stop-mocking-fetch) is used to run pre-commit hooks that run the linter on any staged files to prevent changes that don't pass the linter from being commit, enforcing consistency throughout the codebase.

Some new technologies to me were:

- [TanStack Query](https://tanstack.com/query/latest) (Formerly React Query) - A library to manage fetching, caching and updating data. It automatically handles background synchronization, query invalidation, and mutation updates. I really like the highly opinionated way it handles getting the current data state, and how it makes sharing cached data around the app extremely easy.

- [Mock Service Worker (MSW)](https://mswjs.io/docs/) - Allows you to create a service worker that intercepts all HTTP requests and returns data based on defined mocked handlers. Can be used in the browser, but I found the most benefit when it came to testing. The API layer is completely separate from the application, you can define a full mocked API with CRUD capabilities that can be shared throughout the entire app, and define overrides when necessary. MSW removes the need for stubbing the request client, the `window.fetch` will fully complete, as the mocking is happening a higher level in at the network layer. You do not have to be aware of the implementation details of the fetch response such as headers as the entire fetch method is run from beginning to end, and is completely unaware it is interacting with a mock server. Ultimately it means the tests closer resemble the real user experience and give developers more confidence in them.

Great Kent C. Dodds article on MSW - [Stop mocking fetch](https://kentcdodds.com/blog/stop-mocking-fetch)

The API built on my last experience with API gateway and Lambdas - [Gitify](https://github.com/shaundnz/gitify-serverless-dynamodb-api) - This time with more IaC as this entire app is defined with the CDK. I also challenged myself to thoroughly test the app, to gain experience testing with Lambdas, ultimately it was similar to testing any other server application to verify business logic. I heavily used dependency injection and the Service, Repository Pattern, as this is what I felt keep the app testable and organized, and is what I am familiar with coming from .NET. Because Lambdas are completely unopinionated, I forced my own opinionated architecture, however I am still not sure if this is the best way to handle building Lambda APIs. There are packages like `tsyringe` that help support a DI architecture which I am keen to try out, as well as research other Lambda API architectures.

### Future Improvements

- [ ] Cron job to handle regular updating of tracked playlists
- [ ] Add a admin panel for managing tracked playlists
- [ ] Add OAuth with Spotify provider to connect playlists directly to user accounts

### Contact Me

[Personal Website](https://shaundnz.com/)

[LinkedIn](https://www.linkedin.com/feed/)

[Aws]: https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazonwebservices&logoColor=white
[Aws-url]: aws.amazon.com
[Github-actions]: https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white
[Github-actions-url]: https://github.com/features/actions
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Aws-lambda]: https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white
[Aws-lambda-url]: https://aws.amazon.com/lambda/
[Api-gateway]: https://img.shields.io/badge/AWS_API_Gateway-FF4F8B?style=for-the-badge&logo=amazonapigateway&logoColor=white
[Api-gateway-url]: https://aws.amazon.com/api-gateway/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[Playwright.js]: https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white
[Playwright-url]: https://playwright.dev/
[Spotify.js]: https://img.shields.io/badge/Spotify_API-1DB954?style=for-the-badge&logo=spotify&logoColor=white
[Spotify-url]: https://www.spotify.com/
