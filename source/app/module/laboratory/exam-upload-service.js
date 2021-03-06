(function () {
  'use strict';

  angular
    .module('normalizerjs.module.laboratory')
    .service('normalizerjs.module.laboratory.ExamUploadService', service);

  service.$inject = [
    'otusjs.laboratory.exam.sending.ExamSendingFactory',
    'otusjs.laboratory.exam.sending.Exam',
    'otusjs.laboratory.exam.sending.ExamSendingLot',
    'otusjs.laboratory.exam.sending.ExamObservation',
    'otusjs.laboratory.exam.sending.ExamResults'
  ];

  function service(ExamSendingFactory, Exam, ExamSendingLot, ExamObservation, ExamResults) {
    var self = this;

    /* Public methods */
    self.fileStructureToModel = fileStructureToModel;

    function fileStructureToModel(fileStructure) {
      var examSending = ExamSendingFactory.create();
      examSending.examSendingLot.fileName = fileStructure.fileName;
      examSending.examSendingLot.realizationDate = new Date();
      examSending.examSendingLot.resultsQuantity = 0;
      examSending.examSendingLot.fieldCenter = {
        acronym: fileStructure.getFieldCenter().acronym
      };

      fileStructure.rows.forEach(function (row) {
        if (row.isResult || row.isNewExam || row.isExamObservation || row.isResultObservation) {
          if (row.isNewExam) {
            var newExam = Exam.create();
            newExam.name = row.examName;
            examSending.exams.push(newExam);
          }
          if (row.isResult && examSending.exams && examSending.exams.length) {
            var newResult = ExamResults.create();
            newResult.examName = row.examName;
            newResult.aliquotCode = row.aliquot;
            newResult.releaseDate = row.releaseDate;
            newResult.resultName = row.label;
            newResult.value = row.result;
            examSending.exams[examSending.exams.length - 1].examResults.push(
              newResult
            )
          }
          if (row.isExamObservation && examSending.exams && examSending.exams.length) {
            var observation = ExamObservation.create();
            observation.name = row.label;
            observation.value = row.observation;
            examSending.exams[examSending.exams.length - 1].observations.push(observation);
          }
          if (row.isResultObservation
            && examSending.exams && examSending.exams.length
            && examSending.exams[examSending.exams.length - 1].examResults
            && examSending.exams[examSending.exams.length - 1].examResults.length
          ) {
            var lastExamIndex = examSending.exams.length - 1;
            var lastResultIndex = examSending.exams[lastExamIndex].examResults.length - 1;
            var observation = ExamObservation.create();
            observation.name = row.label;
            observation.value = row.observation;
            examSending.exams[lastExamIndex].examResults[lastResultIndex].observations.push(observation);
          }
        }
      });
      examSending.examSendingLot.resultsQuantity = examSending.getExamList().length;

      return examSending;
    }

  }
}());