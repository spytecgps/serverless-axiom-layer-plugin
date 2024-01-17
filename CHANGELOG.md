# Change Log
All notable changes to this project will be documented in this file.

## [0.0.16] - 2023-11-06

Using the Axiom layer v6 that will include as events attributes in the dataset:
- The lambda awsRquestId
- Level of the log: INFO, WARN, ERROR or DEBUG (debug or trace)
- The message

## [0.0.18] - 2024-01-17

Using the Axiom layer v11 with some features and fixes:
- A message attribute will always contains the logged string.
- The record attribute could be null, depending on whether the logged item is an object or not.
- The message is now correctly parsing the line breaks.