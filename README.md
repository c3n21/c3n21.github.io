# How does deployment work?
Every time there is push on `main` it will trigger the build pipeline and cache
the artifacts.

To actually do the deploy of the website and CV in release artifacts the following must be carried out:

1. Create a PR which only bumps the version
2. By merging the PR it will trigger the deploy pipeline
