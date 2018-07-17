## Why?

**Contenta CMS** (aka _the Drupal part_) is designed to serve your project's
content. ContentaJS (aka _the node.js part_) is designed to serve the requests
to your client side applications. Some of those requests will end up requesting
data from Contenta CMS, others won't.

You may need **ContentaJS** because for many reasons **you will end up needing a
node.js server for your project anyways**. You may as well use an opinionated
and optimized starter kit that will solve many of your needs without effort. 

### Microservices
If your API needs to aggregate data for use on the front-end from other services
you **should not** use PHP for that. That is because, in practice, all I/O in
Drupal is blocking and the performance of these tasks is usually very poor.

Examples of this are:
* Showing weather data from a 3rd party API.
* If you need to make requests to an analytics tool.
* If you need to run a request through an anti-fraud service before accessing the content.

In these situations you will want to treat **Contenta CMS** just as any other
microservice. Then you will need a server, like this one written in node.js, to
orchestrate the different microservices.

### Server-Side Rendering
Chances are that you are building a website as part of your digital project. In
most cases you will be using a front-end framework like React, Vue, Angular,
etc. All of those frameworks recommend using server-side rendering
[for many reasons](https://ssr.vuejs.org/#why-ssr). In order to implement
server-side rendering you will need a node.js server.

You can use this node.js server (aka _ContentaJS_) to implement server-side
rendering on.

### Performance
Your LAMP stack (or alternative) runs your Contenta CMS installation. We all
know how flexible and powerful Drupal is. But at the same time it is not great
from a performance point of view. In fact it can rapidly become your bottleneck.

With ContentaJS you can reduce the load in your LAMP stack. This is because you
don't even need to hit this stack to access cached responses. ContentaJS will
fetch the data from cache, and will only check with Drupal when there is no
cache. That reduces greatly the amount of requests Apache needs to process. This
reduces the load on Drupal, hence improving performance overall.

ContentaJS integrates transparently with Contenta CMS and can analyze requests
that will fail in Drupal. When that happens the request never hits Drupal thus
reducing the load there. Examples of this are: a request to a non-existing
resource, a request that contains a payload that doesn't validate against the
schema of the resource, etc.

### Other
Other server tasks like executing actions on cron, or sending emails, etc. can
be done in this node.js server (and/or the machine running it) instead of on
the LAMP stack.
