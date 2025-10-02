---
applyTo: '**'
---
add test PlayFunction for below stories, test should be meaningful(for visual) and should evaluate based on the current story name,
add test for every stories in the story file 

stories/Dropdown.stories.ts

use chrome chrome-devtools  mcp to quickly test it on storybook interactions tab in addons section,
one of story id for VgDropdown/vg-dropdown is components-dropdown--default
http://localhost:6006/?path=/story/components-dropdown--default

list all the stories and its story id ahead of opening in chrome by fetching below json from storybook server,
curl -s http://localhost:6006/index.json | jq '.entries | to_entries[] | .key'

and mostly browsing story on chrome before writing test and use chrome-devtools to inspect the rendered dom might help you to write test since it will provide information like class names, styles,computed styles etc. and not only test the layouts also tests the interactions like click, hover, focus etc

run type check by,
npm run type-check 

and finally test it by running,
npm run test ./stories/Dropdown.stories.ts

and stories like VgFlexItem should need to have test to verify the visual aspects like alignment, width, relative width, placements, order, spacing etc. and remember component might have used relative units so run test on different resolutions or zoom level in the browser, instead of color, class names or text based verification, for other stories like button, input etc., text,class names and color based verification is fine.

only include tests to verify functionalities of components, don't include tests to verify additional elements in the stories

group tests in step function with descriptions if necessary


#chrome-devtools 

don't use wait_for tool from chrome-devtools, most of time it will not work as expected

and make sure close browser after testing from chrome-devtools mcp