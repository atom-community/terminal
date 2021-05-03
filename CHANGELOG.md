## [1.0.1](https://github.com/atom-community/terminal/compare/v1.0.0...v1.0.1) (2021-05-03)


### Bug Fixes

* activate pane on focus ([cee1511](https://github.com/atom-community/terminal/commit/cee1511f594467a1601f96c43fd1645bb4216f57))

# 1.0.0 (2021-04-29)


### Bug Fixes

* allow showing the terminal when intersectionRatio is not 1 ([7a05451](https://github.com/atom-community/terminal/commit/7a0545149fc5d5917a322bd06f9f9af7a5308717))
* bump deps ([4de3aea](https://github.com/atom-community/terminal/commit/4de3aea97b0a0495b583c6cf90a63762032bdb7f))
* close on error opening shell ([11225e9](https://github.com/atom-community/terminal/commit/11225e9d4f5d72cb4c28338bed3f88434e5f9d73))
* enable ligatures ([10e64ce](https://github.com/atom-community/terminal/commit/10e64ceba8f13eadc96299da526a59d16d1e341d))
* export getDefaultShell and getFallbackShell for testing ([f8fa49b](https://github.com/atom-community/terminal/commit/f8fa49ba7dec189f93f24055974f642e25a09e19))
* Fix context menu on terminal ([#38](https://github.com/atom-community/terminal/issues/38)) ([f9a528e](https://github.com/atom-community/terminal/commit/f9a528e07b6b2a0d084f9544d4206a05bcbcf864))
* move watcher disposable code ([d8b4fc9](https://github.com/atom-community/terminal/commit/d8b4fc9bb5fab14ed77776ff5d0533ce704fc331)), closes [/github.com/atom-community/terminal/pull/24#discussion_r499099903](https://github.com//github.com/atom-community/terminal/pull/24/issues/discussion_r499099903)
* set autoShell only for the first time ([977e6dc](https://github.com/atom-community/terminal/commit/977e6dc528e557d785587fc5dd9e2d7a0930f482))
* set shell to pwsh or powershell if exists ([60b28f4](https://github.com/atom-community/terminal/commit/60b28f414471aa6a2753ca7b8bc1072c29f10eda))
* typo defaultShellCache ([151d6b2](https://github.com/atom-community/terminal/commit/151d6b2640a291dff0f498c2ef65f3976b31dda8))
* update deps ([3944561](https://github.com/atom-community/terminal/commit/3944561566f501d759b3457d26534a12e8a4474b))
* update deps ([ec03e67](https://github.com/atom-community/terminal/commit/ec03e673b6f001a955b2d6e2f2ea7021dcd6c64c))
* upgrade whatwg-url from 8.3.0 to 8.4.0 ([a488877](https://github.com/atom-community/terminal/commit/a488877a2a2d1faaf86c7034e998feee9cc81d8e))
* use async exists ([02ad971](https://github.com/atom-community/terminal/commit/02ad9714d15ffe09c13b5a4e982946da262cefc8))
* use fallback in case of an error ([c168765](https://github.com/atom-community/terminal/commit/c168765a9a0190332414992c6edc73bb3703b89f))
* use localStorage to store autoShell ([b49dd6a](https://github.com/atom-community/terminal/commit/b49dd6aa27378323a008fcd78ec7beb2732df381)), closes [/github.com/atom-community/terminal/pull/24#discussion_r499099514](https://github.com//github.com/atom-community/terminal/pull/24/issues/discussion_r499099514)
* use onDidChange instead of observe ([a3b6708](https://github.com/atom-community/terminal/commit/a3b67085261f747c42a591c6d153560636ea9f95))
* **deps:** update deps ([54734e4](https://github.com/atom-community/terminal/commit/54734e403efdc876170e148a226d626da7bed8fa))


### Features

* add defaultSellCache to improve performance ([16e51aa](https://github.com/atom-community/terminal/commit/16e51aa619c44f35b09672d5d563f48d9d02ac1c))
* add focus command ([fef8c6a](https://github.com/atom-community/terminal/commit/fef8c6a003be0ee7ce9bf22381c0a34a7b712a2a))
* add ligatures config (default to true) ([6a5c437](https://github.com/atom-community/terminal/commit/6a5c437661f0e45e2cbfbb36858af20cdf41a52f))
* add terminal:clear command ([5be215a](https://github.com/atom-community/terminal/commit/5be215af5ab3b8b171526d64ad23df64f687de64))
* add tool-bar button ([248825d](https://github.com/atom-community/terminal/commit/248825dbb2608d42fe4d1d0412c50fbb507c61ea))
* add tree view context menu ([941868f](https://github.com/atom-community/terminal/commit/941868f157e71a3c8d2ed41efdfcfab772e88104))
* autoShell config ([769abfe](https://github.com/atom-community/terminal/commit/769abfe9c66ec71e7537a7ec07387071ff79ccef))
* enable copy on select by default ([3766adb](https://github.com/atom-community/terminal/commit/3766adb12ee0888d2f2ca1fec45b00097a623469))
* getDefaultShell finds the default shell start commmand ([4c9aebe](https://github.com/atom-community/terminal/commit/4c9aebe6dfdbb182a57b3c2137ef48923b0c1542))
* getFallbackShell ([8755e11](https://github.com/atom-community/terminal/commit/8755e11762a40fbe754778631828c163ca5608ec))
* import webgl and ligatures using dynamic import ([c1311b6](https://github.com/atom-community/terminal/commit/c1311b6dcb8279de02fe75efd3688a723eb925e3))
* import WebLinksAddon using dynamic import ([eb3bfc3](https://github.com/atom-community/terminal/commit/eb3bfc31d72f062cc5dc4e84817ede4d08fa7f49))
* install which to find programs ([d108320](https://github.com/atom-community/terminal/commit/d1083206f4741c54c4ac7b89d3f8a5566ebb43cf))
* open in the bottom dock by default ([348c619](https://github.com/atom-community/terminal/commit/348c61979177c0dba80988afa587d492258f79b1))
* rename to atomic-terminal ([bc5929c](https://github.com/atom-community/terminal/commit/bc5929cc258a42f62974c88748ba3ccfed3c779c))
* set start command asyncronously inside activate ([68da18c](https://github.com/atom-community/terminal/commit/68da18c2934709737cecb5fde3f92745b7f32801))
* setShellStartCommand: set start command asyncronously ([2140047](https://github.com/atom-community/terminal/commit/21400478a5c4e10d5219403d0f7d5c8c57b8e97f))
* use getFallbackShell as the default value for shell ([ea5a014](https://github.com/atom-community/terminal/commit/ea5a01467e56e2856c8342dc62c5fa5ea59a525f))


### Reverts

* Revert "fix: use isIntersecting" ([b4795cc](https://github.com/atom-community/terminal/commit/b4795cc55c1853560065e29b8313f3f3b180f92b))
