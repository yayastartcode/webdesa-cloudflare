import { readBody } from "../../validation";
import type { RouteContext } from "../../context";

export function createHandlers({ store, session }: RouteContext) {

// GET - Fetch population data
async function GET() {
  try {
    const populationData = await store.populationData.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return Response.json({
      success: true,
      data: populationData
    });
  } catch (error) {
    console.error('Error fetching population data:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch population data' },
      { status: 500 }
    );
  }
}

// POST - Create or update population data
async function POST(request: Request) {
  try {


    if (!session || !session.user || session.user.role !== "ADMIN") {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await readBody(request, "population-data");
    const {
      totalPopulation,
      malePopulation,
      femalePopulation,
      households,
      temporaryResidents,
      populationMutations
    } = body;

    // Validate required fields
    if (
      typeof totalPopulation !== 'number' ||
      typeof malePopulation !== 'number' ||
      typeof femalePopulation !== 'number' ||
      typeof households !== 'number' ||
      typeof temporaryResidents !== 'number' ||
      typeof populationMutations !== 'number'
    ) {
      return Response.json(
        { success: false, error: 'All fields must be valid numbers' },
        { status: 400 }
      );
    }

    // Validate that male + female = total
    if (malePopulation + femalePopulation !== totalPopulation) {
      return Response.json(
        { success: false, error: 'Male and female population must sum to total population' },
        { status: 400 }
      );
    }

    // Check if population data already exists
    const existingData = await store.populationData.findFirst();

    let populationData;
    if (existingData) {
      // Update existing data
      populationData = await store.populationData.update({
        where: { id: existingData.id },
        data: {
          totalPopulation,
          malePopulation,
          femalePopulation,
          households,
          temporaryResidents,
          populationMutations
        }
      });
    } else {
      // Create new data
      populationData = await store.populationData.create({
        data: {
          totalPopulation,
          malePopulation,
          femalePopulation,
          households,
          temporaryResidents,
          populationMutations
        }
      });
    }

    return Response.json({
      success: true,
      data: populationData
    });
  } catch (error) {
    console.error('Error saving population data:', error);
    return Response.json(
      { success: false, error: 'Failed to save population data' },
      { status: 500 }
    );
  }
}
return { GET, POST };
}
