act workflow_dispatch --artifact-server-path $PWD/.artifacts -s GITHUB_TOKEN="$(gh auth token)" --use-new-action-cache -W "$1"
