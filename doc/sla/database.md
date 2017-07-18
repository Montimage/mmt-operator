
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
    - `conditions`: object, each attribute name is name of one metric
    - `actions`: object, each attribute name is name of one reactor
    - `priority`: string, "HIGH", "MEDIUM", "LOW"
    - `enable`: bool
    - `note`: string, description of this reaction 
  
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
9. number, is percentage*100 of the reactions being done or the percentage of reactors being. 0 if no reaction is done, 100 if all reactions are done.

## metrics_reactions

This collection is used by MUSA project.
Each entry of this collection is a reaction when one or several metrics being alerted or violated.

1. number, timestamp when the reaction is triggered
2. number, application ID
3. number, component ID
4. string, reaction ID
5. array, 