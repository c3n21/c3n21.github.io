# flake.nix "flake" "imports"
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    nvim.url = "path:/home/zhifan/.config/nvim";

    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      nvim,
      flake-parts,
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
        let
          nvim-pkgs = nvim.packages.${system};
        in
        {
          devShells.default = pkgs.mkShell {
            name = "nodejs-dev-shell";
            buildInputs =
              with pkgs;
              [
                nodejs_22 # Specify Node.js version
                pnpm

                # GitHub action local testing
                act
                gh
              ]
              ++ (with nvim-pkgs; [ nastro ]);

            GITHUB_RUN_NUMBER = 10;
            NEOVIM_CONFIG_LINES = 123123;

            shellHook = ''
              echo "Welcome to the Node.js development environment using system ${system}!"
              echo "Node.js version: $(node --version)"
            '';
          };

          # Optionally define a package for the project
          # packages.default = pkgs.stdenv.mkDerivation {
          #   name = "nodejs-project";
          #   src = ./.;
          #
          #   buildInputs = with pkgs; [nodejs-18_x];
          #
          #   installPhase = ''
          #     mkdir -p $out
          #     cp -r * $out
          #   '';
          # };
        };
    };
}
