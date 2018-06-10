## Internal Development Notes
_This is a dumping ground of notes. This section will disappear eventually, it's
just meant to save ideas for documentation to process some other time._

- Introduce the ability to timeout requests.
- Create a separate package using passport to integrate with Simple OAuth.
- Make CORS customizable from configuration.
- If all subrequests are to the CMS forward the blueprint to Drupal's subrequests.
- Compute the appropriate cache-control header from subquests responses.
- Make Flow types nicer in the middlewares.
- Validate the request bodies before reaching the CMS using the resource schemas.
- Filter requests that the CMS should not be bothered with using the resource lists.
- Make sure to mention that the /healthckeck is for auto-scaling policies.
- Create @contentacms/… submodules for logging interfaces like Splunk.
- Create a @contentacms/redisShare submodule for a shared Redis server between
  Drupal and node.
