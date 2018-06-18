## Internal Development Notes
_This is a dumping ground of notes. This section will disappear eventually, it's
just meant to save ideas for documentation to process some other time._

- Introduce the ability to timeout requests.
- Create a separate package using passport to integrate with Simple OAuth.
- If all subrequests are to the CMS forward the blueprint to Drupal's subrequests.
- Compute the appropriate cache-control header from subquests responses.
- Make sure to mention that the /healthckeck is for auto-scaling policies.
- Create a @contentacms/redisShare submodule for a shared Redis server between
  Drupal and node.
- Document that the proxied requests are not cached because they are considered
  end responses. The appropriate caching should be in the edge cache layer.
- Make Cache-Control header overrides configurable.
- Check feature conflict between cors.maxAge and OPTIONS cache control header.
