{
  inputs = {
    nixpkgs.url = "nixpkgs/nixpkgs-unstable";
    nixpkgs-unstable.url = "nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = {
    nixpkgs,
    nixpkgs-unstable,
    flake-parts,
    rust-overlay,
    ...
  }@inputs:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" ];
      perSystem = { config, self', pkgs, pkgs-unstable, lib, system, ... }:
        let
          runtimeDeps = with pkgs; [
            at-spi2-atk
            atkmm
            cairo
            gdk-pixbuf
            glib
            gtk3
            harfbuzz
            librsvg
            libsoup_3
            pango
            webkitgtk_4_1
            openssl

            jdk17
            lerc
            libdatrie
            libepoxy
            libselinux
            libsepol
            libthai
            libxkbcommon
            pcre2
            pkg-config
          ];
          buildDeps = with pkgs; [
            pkg-config
            gobject-introspection
            cargo
            cargo-tauri

            nodejs

            # Use corepack to install npm/pnpm/yarn as specified in package.json
            corepack

            # required to enable the language server
            pkgs-unstable.nodePackages.typescript
            pkgs-unstable.nodePackages.typescript-language-server
            pkgs-unstable.svelte-language-server

            # Python is required on NixOS if the dependencies require node-gyp
            # python3
          ];
          devDeps = with pkgs; [
            
          ];

          buildToolsVersion = "34.0.0";
          androidComposition = pkgs.androidenv.composeAndroidPackages {
            buildToolsVersions = [ "30.0.3" buildToolsVersion ];
            platformVersions = [ "34" ];
            includeNDK = true;
          };

          mkDevShell = rustc: pkgs.mkShell rec {
            ANDROID_HOME = "${androidComposition.androidsdk}/libexec/android-sdk";
            NDK_HOME     = "";
            GRADLE_OPTS  = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${ANDROID_HOME}/build-tools/${buildToolsVersion}/aapt2";
            RUST_SRC_PATH = "${pkgs.rustPlatform.rustLibSrc}";
            WEBKIT_DISABLE_COMPOSITING_MODE = 1;

            buildInputs = runtimeDeps;
            nativeBuildInputs = buildDeps ++ devDeps ++ [ rustc ];
          };
        in {
          _module.args.pkgs = import nixpkgs {
            inherit system;

            overlays = [ (import rust-overlay) ];
            
            config = {
              allowUnfree = true;
              android_sdk.accept_license = true;
            };
          };

          _module.args.pkgs-unstable = import nixpkgs-unstable {
            inherit system;
            config.allowUnfree = true;
          };

          # packages.default = self'.packages.example;
          devShells.default = self'.devShells.nightly;

          # packages.example = (rustPackage "foobar");
          # packages.example-base = (rustPackage "");

          devShells.nightly = (mkDevShell (pkgs.rust-bin.selectLatestNightlyWith (toolchain: toolchain.default)));
          devShells.stable = (mkDevShell pkgs.rust-bin.stable.latest.default);
          # devshells.msrv = (mkDevShell pkgs.rust-bin.${msrv}.default);
        };
    };
}
