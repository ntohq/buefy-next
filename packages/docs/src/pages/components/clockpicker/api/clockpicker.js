export default [
    {
        props: [
            {
                name: '<code>v-model</code>',
                description: 'Binding value',
                type: 'Date',
                values: '—',
                default: '—'
            },
            {
                name: '<code>type</code>',
                description: 'Type (color) of the button <strong>when checked</strong>',
                type: 'String',
                values: `<code>is-white</code>, <code>is-black</code>, <code>is-light</code>,
                    <code>is-dark</code>, <code>is-primary</code>, <code>is-info</code>, <code>is-success</code>,
                    <code>is-warning</code>, <code>is-danger</code>,
                    and any other colors you've set in the <code>$colors</code> list on Sass`,
                default: '<code>is-primary</code>'
            },
            {
                name: '<code>hour-format</code>',
                description: 'Hour format for input and display',
                type: 'String',
                values: '<code>12</code> or <code>24</code>',
                default: '<code>undefined</code>: default to browser locale.'
            },
            {
                name: '<code>increment-minutes</code>',
                description: 'Unit for increment minutes ',
                type: 'Number',
                values: '—',
                default: '<code>5</code>'
            },
            {
                name: '<code>time-formatter</code>',
                description: 'Function to format time (<code>Date</code> type) to a string for display in the input',
                type: 'Function',
                values: '—',
                default: '<code>(time) => new Intl.DateTimeFormat(locale).format(time)</code>'
            },
            {
                name: '<code>time-parser</code>',
                description: 'Function to parse string to a time (<code>Date</code> type) for set a time from the input to the component',
                type: 'Function',
                values: '—',
                default: 'Tries to parse the time using the locale specific format. Fallback to <code>HH:mm</code> or <code>HH:mm AM/PM</code>'
            },
            {
                name: '<code>min-time</code>',
                description: 'Earliest time available for selection',
                type: 'Date',
                values: '—',
                default: '—'
            },
            {
                name: '<code>max-time</code>',
                description: 'Latest time available for selection',
                type: 'Date',
                values: '—',
                default: '—'
            },
            {
                name: '<code>size</code>',
                description: 'Vertical size of input, optional',
                type: 'String',
                values: '<code>is-small</code>, <code>is-medium</code>, <code>is-large</code>',
                default: '—'
            },
            {
                name: '<code>inline</code>',
                description: 'Clockpicker is shown inline, input is removed',
                type: 'Boolean',
                values: '—',
                default: '<code>false</code>'
            },
            {
                name: '<code>editable</code>',
                description: 'Enable input/typing. <b>Note that you might have to set a custom time parser</b>',
                type: 'Boolean',
                values: '—',
                default: '<code>false</code>'
            },
            {
                name: '<code>disabled</code>',
                description: 'Disables the input field and/or picker',
                type: 'Boolean',
                values: '—',
                default: '<code>false</code>'
            },
            {
                name: '<code>loading</code>',
                description: 'Add the loading state to the input',
                type: 'Boolean',
                values: '—',
                default: '<code>false</code>'
            },
            {
                name: '<code>icon</code>',
                description: 'Icon name to be added',
                type: 'String',
                values: '—',
                default: '—'
            },
            {
                name: '<code>icon-pack</code>',
                description: 'Icon pack to use',
                type: 'String',
                values: '<code>mdi</code>, <code>fa</code>, <code>fas</code>, <code>far</code>, <code>fad</code>, <code>fal</code>',
                default: '<code>mdi</code>'
            },
            {
                name: '<code>unselectable-times</code>',
                description: 'Array of unselectable times (Date object)',
                type: 'Array',
                values: '—',
                default: '-'
            },
            {
                name: '<code>mobile-native</code>',
                description: 'Enable native timepicker on mobile',
                type: 'Boolean',
                values: '<code>true</code>, <code>false</code>',
                default: '<code>true</code>'
            },
            {
                name: '<code>mobile-modal</code>',
                description: 'Clockpicker is shown into a modal on mobile',
                type: 'Boolean',
                values: '<code>true</code>, <code>false</code>',
                default: '<code>true</code>'
            },
            {
                name: '<code>position</code>',
                description: 'Optional, position of the timepicker relative to the input',
                type: 'String',
                values: '<code>is-top-right</code>, <code>is-top-left</code>, <code>is-bottom-left</code>',
                default: '<code>Bottom Right</code>'
            },
            {
                name: '<code>auto-switch</code>',
                description: 'Automatically switches between hour and minutes selection after click',
                type: 'Boolean',
                values: '<code>true</code>, <code>false</code>',
                default: '<code>true</code>'
            },
            {
                name: '<code>open-on-focus</code>',
                description: 'Open clockpicker on input focus',
                type: 'Boolean',
                values: '—',
                default: '<code>false</code>'
            },
            {
                name: '<code>hours-label</code>',
                description: `Label to show on hour button`,
                type: 'String',
                values: '—',
                default: `<code>Hours</code>`
            },
            {
                name: '<code>minutes-label</code>',
                description: `Label to show on minutes button`,
                type: 'String',
                values: '—',
                default: `<code>Min</code>`
            },
            {
                name: '<code>append-to-body</code>',
                description: 'Append clockpicker calendar to body (prevents event bubbling)',
                type: 'Boolean',
                values: '—',
                default: '<code>false</code>'
            },
            {
                name: '<code>locale</code>',
                description: `Accept a string with a BCP 47 language tag, or an array of such strings.
                See <a href="https://www.unicode.org/reports/tr35/tr35.html#BCP_47_Conformance" target="_blank">Unicode BCP 47 locale identifier</a>`,
                type: 'String, Array of String',
                values: '—',
                default: '<code>undefined</code>: default to browser locale.'
            },
            {
                name: '<code>compat-fallthrough</code>',
                description: 'Whether <code>class</code>, <code>style</code>, and <code>id</code> attributes are applied to the root &lt;div&gt; element or the underlying input component. If <code>true</code>, they are applied to the root &lt;div&gt; element, which is compatible with Vue 2.',
                type: 'Boolean',
                values: '-',
                default: '<code>true</code>. Can be changed via <code>defaultCompatFallthrough</code> config option.'
            },
            {
                name: 'Any native attribute',
                description: '—',
                type: '—',
                values: '—',
                default: '—'
            },
        ],
        slots: [
            {
                name: 'default',
                description: 'Footer',
                props: '—'
            },
            {
                name: 'trigger',
                description: 'Trigger',
                props: '—'
            }
        ],
        methods: [
            {
                name: '<code>close</code>',
                description: 'Close dropdown'
            }
        ]
    }
]
