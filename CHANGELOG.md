# Changelog

### 2.11.5 (2021-08-30)

Fixed:

-   default resources update interval fixed

### 2.11.4 (2021-08-30)

Changed:

-   docker base image changed to softvisio/node

### 2.11.3 (2021-08-30)

Fixed:

-   scripts renamed

### 2.11.2 (2021-08-30)

Fixed:

-   tests updated

### 2.11.1 (2021-08-30)

Fixed:

-   resources updater
-   benchmarks fixed

### 2.11.0 (2021-08-29)

Added:

-   resources updater

### 2.10.1 (2021-08-28)

-   ignore 404 build error
-   github actions
-   typo

### 2.10.0 (2021-08-28)

Added:

-   github actions

Fixed:

-   mkdir typo
-   github api moved to the core
-   db patches renamed

### 2.9.6 (2021-08-21)

Fixed:

-   dockerignore updated

### 2.9.5 (2021-08-19)

Fixed:

-   fix for remote index not found
-   make sqlite methods synchronous
-   sql sqlite.db property renamed to .sqlite

### 2.9.4 (2021-08-14)

Fixed:

-   updater report improved

### 2.9.3 (2021-08-13)

Fixed:

-   path fixed

### 2.9.2 (2021-08-13)

Fixed:

-   path fixed

### 2.9.1 (2021-08-13)

Fixed:

-   exit code fixed

### 2.9.0 (2021-08-13)

Changed:

-   updater refactored

### 2.8.5 (2021-08-11)

Fixed:

-   updater sync fixed

### 2.8.4 (2021-08-10)

Fixed:

-   deps fixed

### 2.8.3 (2021-08-09)

Fixed:

-   datasets reloader refactored

### 2.8.2 (2021-08-09)

Changed:

Added:

Removed:

Fixed:

-   updater refactored
-   deps fixed

### 2.8.1 (2021-08-09)

Fixed:

-   npmignore fixed

### 2.8.0 (2021-08-09)

Changed:

-   datasets refactored
-   docs updated
-   sources added
-   link to the datasets added

### 2.7.0 (2021-08-06)

Added:

-   country by coordinates improved

### 2.6.14 (2021-08-03)

Fixed:

-   core merged with app

### 2.6.13 (2021-07-31)

Fixed:

-   @softvisio/api added

### 2.6.12 (2021-07-31)

Fixed:

-   imports fixed

### 2.6.11 (2021-07-28)

Fixed:

-   #core/fs removed

### 2.6.10 (2021-07-25)

Fixed:

-   cache max -> maxSize
-   cache-lru changed

### 2.6.9 (2021-07-21)

Fixed:

-   result status updated

### 2.6.8 (2021-07-21)

Added:

-   docker mount softvisio config

### 2.6.7 (2021-07-21)

Added:

-   read github token from env

### 2.6.6 (2021-07-16)

Fixed:

-   utils moved to @softvisio/utils

### 2.6.5 (2021-07-15)

Changed:

-   luxon v2

### 2.6.4 (2021-07-15)

Changed:

-   docs updated

### 2.6.3 (2021-07-11)

Fixed:

-   timezones refactored
-   docs updated

### 2.6.2 (2021-07-09)

Fixed:

-   updated timeout fixed

### 2.6.1 (2021-07-09)

-   updated autoupdate fixed
-   timezones expires fixed
-   use xdg location under windows

### 2.6.0 (2021-07-08)

Added:

-   export script added
-   import script added

### 2.5.2 (2021-07-08)

Fixed:

-   do not update datasets on docker build fixed

### 2.5.1 (2021-07-08)

Fixed:

-   do not update datasets on docker build

### 2.5.0 (2021-07-08)

Added:

-   timezones cache

### 2.4.0 (2021-07-08)

Changed:

-   updater refactored
-   data location under windows updated

### 2.3.0 (2021-07-07)

Changed:

-   databases renamed to datasets

### 2.2.0 (2021-07-07)

Changed:

-   timezones refactored

### 2.1.5 (2021-07-05)

Fixed:

-   docker mount path fixed
-   docs updated
-   docker config updated

### 2.1.4 (2021-06-28)

Fixed:

-   docs updated

### 2.1.3 (2021-06-26)

Added:

-   benchmarks added

### 2.1.2 (2021-06-26)

Fixed:

-   docker stack mode changed to replicated

### 2.1.1 (2021-06-26)

Fixed:

-   typo fixed
-   docs updated
-   docs assets added

### 2.1.0 (2021-06-24)

Changed:

-   deps updated;
-   docs updated;
-   @softvisio/core v4;
-   maxmind user credentials changed;
-   github user credentials changed;
-   moved to github;

### 2.0.2 (2021-06-01)

Changed:

-   softvisio config merged with the package.json;

### 2.0.1 (2021-06-01)

Changed:

-   docs added;
-   lint config removed;
-   api proto refactored;
-   api schema moved to the external files;
-   rpc permissions added;
-   location under linux moved to docker volumes;
-   auth -> ctx;
-   app rpc pass auth as first param on call;

### 2.0.0 (2021-05-19)

Changed:

-   maxmind module added;
-   flagUnicode -> flag_unicode;
-   lint script removed;
-   rpc cache added;
-   rpc cche added;
-   schema added;
-   geotarget api added;
-   rpc apis added;
-   sqlite data added;
-   service api added;

### 1.12.4 (2021-05-13)

Changed:

-   imports updated;

### 1.12.3 (2021-05-02)

Changed:

-   deps updated;

### 1.12.2 (2021-04-17)

Changed:

-   ported to modules;
-   npmrc fund false;

### 1.12.1 (2021-04-01)

Changed:

-   dockerfile fixed;

### 1.12.0 (2021-04-01)

Changed:

-   project renamed;

### 1.11.4 (2021-03-29)

Changed:

-   lint pattern updated;

### 1.11.3 (2021-03-15)

Changed:

-   package renamed;

### 1.11.2 (2021-03-15)

Changed:

-   master -> main;

### 1.11.1 (2021-03-15)

Changed:

-   docker tags updated;

### 1.11.0 (2021-03-15)

Changed:

-   config files renamed;

### 1.10.1 (2021-03-15)

Changed:

-   shared memory fix;

### 1.10.0 (2021-03-14)

Changed:

-   env updated;
-   docker stack hostname removed;

### 1.9.5 (2021-03-13)

Changed:

-   package renamed;
-   docker stack updated;

### 1.9.4 (2021-03-11)

Changed:

-   support for MAXMIND_LICENSE_KEY;
-   logo;

### 1.9.3 (2021-03-10)

Changed:

-   disable healthcheck;
-   docker stack updated;

### 1.9.2 (2021-03-10)

Changed:

-   docker stack updated;

### 1.9.1 (2021-03-10)

Changed:

-   docker-compose.yaml renamed to docker-stack.yaml;

### 1.9.0 (2021-03-09)

Changed:

-   merged with @softvisio/core;
-   unlinkSync replaced with rmSync;

### 1.8.7 (2021-03-08)

Changed:

-   maxmind install script removed;

### 1.8.6 (2021-03-08)

Changed:

-   maxmind install script removed;

### 1.8.5 (2021-03-08)

Changed:

-   maxmind install script removed;

### 1.8.4 (2021-03-08)

Changed:

-   install script removed;

### 1.8.3 (2021-03-08)

Changed:

-   private network added;
-   docker-compose.yaml shebang added;

### 1.8.2 (2021-03-08)

Changed:

-   volume name fixed;
-   cleanup;

### 1.8.1 (2021-03-08)

Changed:

-   docker swarm;

### 1.8.0 (2021-03-08)

Changed:

-   docker swarm;
-   maxmind skip download env added;

### 1.7.0 (2021-03-03)

Changed:

-   share path updated;

### 1.6.0 (2021-03-03)

Changed:

-   updater refactored;

### 1.5.1 (2021-02-22)

Changed:

-   update log imporoved;

### 1.5.0 (2021-02-22)

Changed:

-   update refactored;

### 1.4.4 (2021-02-02)

Changed:

-   console log fixed;

### 1.4.3 (2021-01-31)

-   package-lock disabled

### 1.4.2 (2021-01-27)

-   deps updated

### 1.4.1 (2021-01-26)

-   deps updated

### 1.4.0 (2021-01-26)

-   migrated to node v15

### 1.3.4 (2021-01-12)

-   repeat on download error

### 1.3.3 (2021-01-11)

-   typo

### 1.3.2 (2021-01-08)

-   updater updated
-   deps updated

### 1.3.1 (2021-01-07)

-   updater refactored

### 1.3.0 (2021-01-06)

-   updater refactored

### 1.2.0 (2020-12-16)

-   refactored

### 1.1.2 (2020-12-16)

-   typo

### 1.1.1 (2020-12-16)

-   update script renamed

### 1.1.0 (2020-12-15)

-   maxmind-update script added

### 1.0.0 (2020-12-15)

-   refactored
-   init

### 0.4.0 (2020-12-12)

-   post install script
-   npmignore
-   use shrinkwrap
-   updated

### 0.3.0 (2020-12-09)

-   updater improved

### 0.2.0 (2020-12-08)

-   refactored
-   package renamed

### 0.1.1 (2020-12-07)

-   packge lock

### 0.1.0 (2020-12-07)

-   init
