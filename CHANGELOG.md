# Changelog

## [0.1.0](https://github.com/nodeshift/paicku/compare/paicku-v0.0.8...paicku-v0.1.0) (2026-06-26)


### ⚠ BREAKING CHANGES

* remove Node 20 support, add Node 26

### Features

* remove Node 20 support, add Node 26 ([1e178ee](https://github.com/nodeshift/paicku/commit/1e178ee0e78857bf708946cdb3dd1c2b834b1a61))


### Bug Fixes

* adding bump-minor-pre-major on releases ([3db661c](https://github.com/nodeshift/paicku/commit/3db661c300db34def8a2732f1a0e676360675716))
* adding caching and removing running tests on ubuntu 26 with podman ([8844344](https://github.com/nodeshift/paicku/commit/8844344841e6ccd696fa20d28c6576b261f9623a))
* adding dependabot ([d6f2018](https://github.com/nodeshift/paicku/commit/d6f2018f180484512d692f47eb2bec3e6c10115a))
* adding linter workflow ([b928f6a](https://github.com/nodeshift/paicku/commit/b928f6ad8a06062d13243bdb17f2c7c31c89581e))
* adding podman machine to known hosts ([0ce5b46](https://github.com/nodeshift/paicku/commit/0ce5b46ad9a7389a1315d2e62084aba48e5e85ce))
* adding prompt when altering local files and removing docker-host inherit ([f171e3f](https://github.com/nodeshift/paicku/commit/f171e3f23c44601adc50a92f96a78bbb9f9708d0))
* adding workflow_dispatch on publish release ([9f241ec](https://github.com/nodeshift/paicku/commit/9f241ecda63da804f2d7ca7b336a80619bdb4f8f))
* **ci:** updating pack workflow ([8394ff1](https://github.com/nodeshift/paicku/commit/8394ff1ff66beb0c54e4a401dfa59eb5af5def88))
* **ci:** using podman install action for installing podman ([c7617bd](https://github.com/nodeshift/paicku/commit/c7617bd1f4c91dfcb9a6a0f064bbda43ca3b7922))
* configuring inspect to accept container runtime ([c824f00](https://github.com/nodeshift/paicku/commit/c824f006af970f303e3ab98d089cfac35463ec26))
* **deps:** bump pack CLI from v0.40.7 to 0.40.7 ([fa729ae](https://github.com/nodeshift/paicku/commit/fa729aecc1c92d8cfe83c49c41b026b60913ace4))
* ensuring the builder has always a registry prefix ([add778b](https://github.com/nodeshift/paicku/commit/add778b72f20efc9bd0c1ecc8bd6b4e404191793))
* error while connectin to podman from macos ([f24684e](https://github.com/nodeshift/paicku/commit/f24684e8b6e318555172950d082676f5d8096883))
* fallback for downloading builder image ([19e2d48](https://github.com/nodeshift/paicku/commit/19e2d48eb927cf2d2b0914fb97fd8bcb994b05ba))
* general fixes ([35d1285](https://github.com/nodeshift/paicku/commit/35d12851b1381e9730b834f540b6e2b4688da445))
* increasing time limit on integration tests ([212e212](https://github.com/nodeshift/paicku/commit/212e212c015e25a7606e4d2274e410b71b145c06))
* increasing unit tests, reducing integration tests ([f6e44fe](https://github.com/nodeshift/paicku/commit/f6e44fe6072fb0f650671e8410595bf852315ee3))
* package.json minor fixes ([9df46d7](https://github.com/nodeshift/paicku/commit/9df46d7f38334709b97ea7636329a581d84b0436))
* reducing the amount of integration tests, as it is unecessary and adds a lot of worklfow usage ([440bf71](https://github.com/nodeshift/paicku/commit/440bf71e998aa22fe752a60be679cbf13852c264))
* release-please enabling trusted publisher ([68dead5](https://github.com/nodeshift/paicku/commit/68dead5323a7c7bf498da96fc48c457291553f1f))
* removing color while integration tests ([863e8bb](https://github.com/nodeshift/paicku/commit/863e8bb482c62fe871393c1c8bbe02b58f51ddb9))
* removing the v prefix from the pack update ([9f89859](https://github.com/nodeshift/paicku/commit/9f89859d15abcfa853560988524b12ea0fb70813))
* removing ubuntu 26 from the workflows ([483310c](https://github.com/nodeshift/paicku/commit/483310c610830b2ada04bc30a2cb640e5b9c0b12))
* test scripts for coverage ([4eb3f33](https://github.com/nodeshift/paicku/commit/4eb3f334d462f49b91669cc6e47699e7d0373cda))
* trigger publish workflow only when publishing a release ([ef4895f](https://github.com/nodeshift/paicku/commit/ef4895f322d5f74d803f81e6793b868c9cc2feee))
* update workflows ([8424a71](https://github.com/nodeshift/paicku/commit/8424a71e85bae7bb03acc82b11aa874893659df4))
* updating ci workflows ([a4ac42e](https://github.com/nodeshift/paicku/commit/a4ac42e1a8c49c5ed3a09d28e3b28cb1cbf87852))
* using github token for openging a PR updating pack ([908a740](https://github.com/nodeshift/paicku/commit/908a74062fb79d19b14f8d29a99b09e184b2ab50))
* using NODESHIFT_RELEASES_TOKEN on publish npm package ([c3c7def](https://github.com/nodeshift/paicku/commit/c3c7def6dcc6b7209b52b80d3ca3bc2472452693))
* using NODESHIFT_RELEASES_TOKEN on publish npm package ([0745487](https://github.com/nodeshift/paicku/commit/0745487f83213b5729774eb23f7b9996ec917929))
* using NPM_TOKEN for publishing a relase on npm ([5a5fa53](https://github.com/nodeshift/paicku/commit/5a5fa53b0e36bfcaaedb501d06df361457e83d69))
* When calling it programmatically and daemon has not been configured correctly ([0e4623f](https://github.com/nodeshift/paicku/commit/0e4623f33deeda5f56b9c052b0848befc2dfa921))
* Workflow fixes ([4ea5ffb](https://github.com/nodeshift/paicku/commit/4ea5ffb9994c6010e9b1d039ef39319c3bb1eb8e))

## [0.0.8](https://github.com/nodeshift/paicku/compare/v0.0.7...v0.0.8) (2026-06-24)


### Bug Fixes

* adding caching and removing running tests on ubuntu 26 with podman ([8844344](https://github.com/nodeshift/paicku/commit/8844344841e6ccd696fa20d28c6576b261f9623a))
* adding dependabot ([d6f2018](https://github.com/nodeshift/paicku/commit/d6f2018f180484512d692f47eb2bec3e6c10115a))
* adding linter workflow ([b928f6a](https://github.com/nodeshift/paicku/commit/b928f6ad8a06062d13243bdb17f2c7c31c89581e))
* adding podman machine to known hosts ([0ce5b46](https://github.com/nodeshift/paicku/commit/0ce5b46ad9a7389a1315d2e62084aba48e5e85ce))
* adding prompt when altering local files and removing docker-host inherit ([f171e3f](https://github.com/nodeshift/paicku/commit/f171e3f23c44601adc50a92f96a78bbb9f9708d0))
* configuring inspect to accept container runtime ([c824f00](https://github.com/nodeshift/paicku/commit/c824f006af970f303e3ab98d089cfac35463ec26))
* ensuring the builder has always a registry prefix ([add778b](https://github.com/nodeshift/paicku/commit/add778b72f20efc9bd0c1ecc8bd6b4e404191793))
* error while connectin to podman from macos ([f24684e](https://github.com/nodeshift/paicku/commit/f24684e8b6e318555172950d082676f5d8096883))
* general fixes ([35d1285](https://github.com/nodeshift/paicku/commit/35d12851b1381e9730b834f540b6e2b4688da445))
* increasing time limit on integration tests ([212e212](https://github.com/nodeshift/paicku/commit/212e212c015e25a7606e4d2274e410b71b145c06))
* release-please enabling trusted publisher ([68dead5](https://github.com/nodeshift/paicku/commit/68dead5323a7c7bf498da96fc48c457291553f1f))
* removing color while integration tests ([863e8bb](https://github.com/nodeshift/paicku/commit/863e8bb482c62fe871393c1c8bbe02b58f51ddb9))
* removing ubuntu 26 from the workflows ([483310c](https://github.com/nodeshift/paicku/commit/483310c610830b2ada04bc30a2cb640e5b9c0b12))
* test scripts for coverage ([4eb3f33](https://github.com/nodeshift/paicku/commit/4eb3f334d462f49b91669cc6e47699e7d0373cda))
* update workflows ([8424a71](https://github.com/nodeshift/paicku/commit/8424a71e85bae7bb03acc82b11aa874893659df4))
* updating ci workflows ([a4ac42e](https://github.com/nodeshift/paicku/commit/a4ac42e1a8c49c5ed3a09d28e3b28cb1cbf87852))
* using github token for openging a PR updating pack ([908a740](https://github.com/nodeshift/paicku/commit/908a74062fb79d19b14f8d29a99b09e184b2ab50))
* When calling it programmatically and daemon has not been configured correctly ([0e4623f](https://github.com/nodeshift/paicku/commit/0e4623f33deeda5f56b9c052b0848befc2dfa921))
* Workflow fixes ([4ea5ffb](https://github.com/nodeshift/paicku/commit/4ea5ffb9994c6010e9b1d039ef39319c3bb1eb8e))
