
# Collections

## metrics

This collection is used by MUSA project.

Structure of `metrics` collection in Database

- Each application is sotred as one entry in `metrics` collection

  + `app_id`: ID of the application
  + `components`: is an array of the components of the application
  + `metrics`: is a set of default metrics that can be used by any component. Each component has its specific owner metrics set in `components.metrics`.
  + `selectedMetric`: is an array. Each element of array represents the set of selected metrics of one component. The metrics defined in `metrics` and `components.metrics` are initial and primitive while the `selectedMetric` defines only metrics being selected and its real values of thresholds being set by user.
  + `selectedReaction`: is an object. Each attribute value represents one reaction when one or several metrics being alerted and vilolated. One attribute value is one object having the following attribute:
    - `comp_id`: number, component ID
    - `conditions`: object, each attribute name is name of one metric, e.g., conditions: {"incident": ["alert","violate"], "vuln_scan_freq" : ["violate"]}
    - `actions`: array, each element name is name of one reactor
    - `priority`: string, "HIGH", "MEDIUM", "LOW"
    - `enable`: bool
    - `note`: string, description of this reaction 
  
  For example, let examinate the following reaction:
  ```JSON
  {
      "comp_id" : 10,
      "condition" : {
         "incident" : ["alert", "violate"],
         "vuln_scan_freq" : ["violate"]
      },
      "actions": ["down_5min", "restart_apache"],
      "priority": "HIGH",
      "enable": true,
      "note" : "xxxx"
  }
  ```
  
  The actions in this reaction will be triggered when we have the following conditions:
      + the metric `incident` issues alerts or violations
      + and, the metric `vuln_scan_freq` issues violations
      + and, the above conditions must happen in a prefixed period, such as, 10 seconds. This period is configurable.
      
  A condition can be used to satisfy many reactions. It will not be considered after the prefixed period.
  
  The actions of a reaction are triggerred as soon as its condition is satisified. 
  
  The actions are triggered by broadcast a message on the corresponding channels. 
  The reactors must listen on their channels to perform their actions. 
  Currently the reaction manager does not care about the processing of the actions. It finishes the work by broadcasting the message.

## availability

1. number, report ID: 50
2. number, component/probe ID
3. number, timestamp
4. number, report counter
5. number, 1 = avail, 0 = not_avail
6. number, 1

## metrics_alerts

This collection is used by MUSA project.
Each entry of this collection is an alert of each metric.
   
1. number, timestamp when the metric is violated/alert
2. number, application ID
3. number, component ID 
4. string, metric ID
5. string, type is either `violation` or `alert`
6. string, is priority: "HIGH", "NORMAL", "LOW"
7. string, is the threshold designed by the metric at the checking moment, e.g., "<= 0.9"
8. number, is the value calculated at the checking moment, e.g., 0.4

## metrics_reactions

This collection is used by MUSA project.
Each entry of this collection is a reaction when one or several metrics being alerted or violated.

1. number, timestamp when the reaction is triggered
2. number, application ID
3. number, component ID
4. string, reaction ID
5. string, action ID 
6. string, reaction description