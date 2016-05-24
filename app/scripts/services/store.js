'use strict';

/**
 * @ngdoc factory
 * @name itapapersApp.store
 * @description
 * # store
 * Factory in the itapapersApp.
 */
angular.module('itapapersApp')
  .factory('store', ['$http', '$q', 'server', 'localStorageService', 'utils', 'ceStore', 'definitions', function ($http, $q, server, localStorageService, utils, ceStore, ce) {

    function filterData (data) {
      var documentMap = {};
      var i, paperId;

      // loop through query results
      //    - remove results with multiple citations
      //    - select citation count with most citations
      //    - collapse variants into one entry
      for (i = 0; i < data.results.length; ++i) {
        paperId = data.results[i][0];
        var paperProps = data.instances[paperId].property_values;

        // paper properties
        var citationCount = utils.getIntProperty(paperProps, ce.paper.citationCount);
        var variantList = utils.getListProperty(paperProps, ce.paper.variantList);
        var paperType = utils.getType(data.instances[paperId].direct_concept_names);

        // ignore duplicates
        if (!documentMap[paperId]) {
          var variantFound = false;
          var maxCitations = 0;

          // find max variant
          if (variantList) {
            for (var j = 0; j < variantList.length; ++j) {
              var variantId = variantList[j];

              if (documentMap[variantId]) {
                maxCitations = documentMap[variantId].citations > maxCitations ? documentMap[variantId].citations : maxCitations;
                variantFound = variantId;
              }
            }
          }

          // set citation count in map
          if (!variantFound) {
            documentMap[paperId] = {
              citations: citationCount,
              index: i,
              types: [paperType]
            };
          } else {
            if (maxCitations < citationCount) {
              var variantTypes = documentMap[variantFound].types.slice();
              documentMap[variantFound] = null;
              documentMap[paperId] = {
                citations: citationCount,
                index: i,
                types: [paperType].concat(variantTypes)
              };
            } else {
              documentMap[variantFound].types.push(paperType);
            }
          }
        }
      }

      var filteredResults = [];

      // recreate array - test for index to remove duplicate citations
      for (i = 0; i < data.results.length; ++i) {
        paperId = data.results[i][0];
        if (documentMap[paperId] && documentMap[paperId].index === i) {
          data.results[i].push(documentMap[paperId].types);
          filteredResults.push(data.results[i]);
        }
      }

      var filteredData = {
        instances: data.instances,
        data: filteredResults
      };

      return filteredData;
    }

    function getDocuments () {
      var key = "document citations";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?returnInstances=true";

          return $http.get(url)
            .then(function(response) {
              var filtered = filterData(response.data);
              localStorageService.set(key + "-" + ceStore, filtered);

              return filtered;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getDataForCompute (queryName) {
      var conNames = "";

      conNames += "published person,";
      conNames += "document,";
      conNames += "co-author statistic,";
      conNames += "paper citation count,";
      conNames += "ordered author,";
      conNames += "published organisation,";
      conNames += "topic-person statistic,";
      conNames += "topic-organisation statistic";

      var url = server + ceStore + "/special/instances-for-multiple-concepts?conceptNames=" + conNames + '&style=summary';

      return $http.get(url);
    }

    function getPublishedPeople () {
      var url = server + ceStore + "/queries/published person citations/execute?returnInstances=true";

      return $http.get(url)
        .then(function(response) {
          var filtered = response.data.results;

          return {
            data: filtered,
            instances: response.data.instances
          };
        }, function(err) {
          return err;
        });
    }

    // Not used
    function getEventSeries () {
      var key = "event series";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute";

          return $http.get(url)
            .then(function(response) {
              var filtered = response.data.results;
              localStorageService.set(key + "-" + ceStore, filtered);

              return filtered;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getProjects () {
      var key = "projects";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?returnInstances=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getOrganisations () {
      var key = "organisations";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?returnInstances=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getTopics() {
      var key = "topics";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?returnInstances=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getStatistics () {
      var key = "totals";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?returnInstances=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getLastUpdated () {
      var key = "last updated";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getAuthor (authorName) {
      if (localStorageService.isSupported) {
        var val = localStorageService.get(authorName);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/instances/" + authorName + "?showStats=true&steps=2&style=summary&referringInstances=false&limitRelationships=default%20organisation,wrote,author,final%20date,citation%20count,co-author,co-author%20statistic";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(authorName, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getPaper (paperName) {
      if (localStorageService.isSupported) {
        var val = localStorageService.get(paperName);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/instances/" + paperName + "?style=summary&steps=2&referringInstances=false";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(paperName, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getVenue (location) {
      if (localStorageService.isSupported) {
        var val = localStorageService.get(location);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/instances/" + location;

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(location, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getOrganisation (organisation) {
      if (localStorageService.isSupported) {
        var val = localStorageService.get(organisation);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/instances/" + organisation + "?style=summary&referringInstances=false&steps=3&limitRelationships=is%20located%20at,employs,citation%20count,wrote,final%20date";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(organisation, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getTopic (topic) {
      if (localStorageService.isSupported) {
        var val = localStorageService.get(topic);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/instances/" + topic + "?style=summary&referringInstances=false&steps=3&limitRelationships=topic%20statistic,person,document,citation%20count,organisation";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(topic, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getOrganisationPublications () {
      var key = "organisation publications";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?returnInstances=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getPersonDetails () {
      var key = "person details";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?showStats=false&suppressCe=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getPeopleOrgs () {
      var key = "published person -> organisation";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?showStats=false&suppressCe=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getPersonDocument () {
      var key = "person -> document";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?showStats=false&suppressCe=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getDocumentDetails () {
      var key = "document details";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?showStats=false&suppressCe=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getProject (project) {
      if (localStorageService.isSupported) {
        var val = localStorageService.get(project);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/instances/" + project + "?steps=2&style=summary&referringInstances=false&limitRelationships=paper,technical%20area,citation%20count";
          return $http.get(url)
            .then(function(response) {
              localStorageService.set(project, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getEventSeriesDetails () {
      var key = 'event series details';

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key + "-" + ceStore);

        if (val) {
          return $q.when(val);
        } else {
          var url = server + ceStore + "/queries/" + key + "/execute?returnInstances=true";

          return $http.get(url)
            .then(function(response) {
              localStorageService.set(key + "-" + ceStore, response.data);
              return response.data;
            }, function(err) {
              return err;
            });
        }
      }
    }

    function getVoiceAcceptance () {
      var key = "voice";

      if (localStorageService.isSupported) {
        var val = localStorageService.get(key);

        return $q.when(val);
      } else {
        return $q.when(false);
      }
    }

    function setVoiceAcceptance (accepted) {
      var key = "voice";

      if (localStorageService.isSupported) {
        localStorageService.set(key, accepted);
      }
    }

    return {
      getDataForCompute: getDataForCompute,
      getDocuments: getDocuments,
      getPublishedPeople: getPublishedPeople,
      getEventSeries: getEventSeries,
      getProjects: getProjects,
      getOrganisations: getOrganisations,
      getTopics: getTopics,
      getAuthor: getAuthor,
      getPaper: getPaper,
      getVenue: getVenue,
      getOrganisation: getOrganisation,
      getTopic: getTopic,
      getPersonDetails: getPersonDetails,
      getPeopleOrgs: getPeopleOrgs,
      getPersonDocument: getPersonDocument,
      getDocumentDetails: getDocumentDetails,
      getProject: getProject,
      getEventSeriesDetails: getEventSeriesDetails,
      getVoiceAcceptance: getVoiceAcceptance,
      setVoiceAcceptance: setVoiceAcceptance,
      getStatistics: getStatistics,
      getLastUpdated: getLastUpdated
    };
  }]);
