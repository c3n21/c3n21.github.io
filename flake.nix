# flake.nix "flake" "imports"
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
      self,
      nixpkgs,
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

          playwrightLibs = with pkgs; [
            alsa-lib
            at-spi2-atk
            atk
            cairo
            cups
            dbus
            expat
            fontconfig
            freetype
            gdk-pixbuf
            glib
            gtk3
            libX11
            libXcomposite
            libXcursor
            libXdamage
            libXext
            libXfixes
            libXi
            libXrandr
            libXrender
            libdrm
            libgbm
            libglvnd
            libudev-zero
            libxcb
            libxkbcommon
            mesa
            nspr
            nss
            pango
            pipewire
            stdenv.cc.cc.lib
            wayland
          ];
        in
        {
          devShells.default = pkgs.mkShell {
            name = "nodejs-dev-shell";
            buildInputs =
              with pkgs;
              [
                nodejs_24
                pnpm

                # GitHub action local testing
                act
                gh
              ]
              ++ playwrightLibs;

            NIX_LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath playwrightLibs}";
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
