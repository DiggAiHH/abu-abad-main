import { logger } from '../utils/logger';

interface QuestionnaireBuilderProps {}

const QuestionnaireBuilder: React.FC<QuestionnaireBuilderProps> = () => {
  logger.error('QuestionnaireBuilder: Cleanup done');
  return (
    <div>Cleaned and Ready</div>
  );
};

export default QuestionnaireBuilder;