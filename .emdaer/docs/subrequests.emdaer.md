# Subrequests <img align="right" src="./logo.svg" alt="Contenta logo" title="Contenta logo" width="100">

Subrequests is a request aggregator project that will allow you to turn multiple
requests into a single one. To do so client-side applications describe the
requests they want to do in a JSON document and send that document to the
server. In turn, the server interprets that document, called _blueprint_, and
executes all the those requests in the clients behalf.

There are two big benefits when using this approach:
  - There is only one round trip between server an client. The client to server
  communications may be weak (ex: over 3G), but the server to server
  communications are always very reliable.
  - If your requests are resolved by the same server processing the blueprints,
  you eliminate completaly the latency introduced by sequential requests. That
  introduces a dramatic performance improvement.

Subrequests is implemented as a [Drupal module](https://www.drupal.org/project/subrequests)
and as an [express middleware](https://github.com/e0ipso/subrequests-express).
ContentaJS relies on the nodejs implementation of the
[Subrequests specification](http://cgit.drupalcode.org/subrequests/tree/SPECIFICATION.md),
which is exposed in the `/subrequests` route.

If you want to learn more about how your client side applications can use
subrequests to reduce communications latency and improve application performance
read [this article](https://www.lullabot.com/articles/incredible-decoupled-performance-with-subrequests)
or watch [this presentation](https://events.drupal.org/nashville2018/sessions/decoupled-drupal-hard-problems).
