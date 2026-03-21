{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];

      perSystem =
        {
          system,
          pkgs,
          ...
        }:
        {
          devShells.default = pkgs.mkShell {
            name = "nodejs-dev-shell";
            buildInputs = with pkgs; [
              nodejs_22 # Specify Node.js version
              pnpm

              playwright-driver.browsers

              opencode
            ];

            GITHUB_RUN_NUMBER = 10;
            NEOVIM_CONFIG_LINES = 123123;
            PLAYWRIGHT_BROWSERS_PATH = pkgs.playwright-driver.browsers;
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;

            shellHook = ''
              echo "Welcome to the Node.js development environment using system ${system}!"
              echo "Node.js version: $(node --version)"
            '';
          };
        };
    };
}
